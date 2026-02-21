/**
 * Petting logic - used by run.post (cron) and trigger.post (manual).
 * ONLY calls interact() on Aavegotchi diamond - no ETH transfers.
 */
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import {
  getDelegatedOwners,
  getBotState,
  getPettingIntervalHours,
  addTransaction,
  addWorkerLogs,
  addError,
  setBotState,
} from '~/lib/kv'

const AAVEGOTCHI_DIAMOND = '0xA99c4B08201F2913Db8D28e71d020c4298F29dBF' as const

const AAVEGOTCHI_ABI = parseAbi([
  'function interact(uint256[] calldata _tokenIds) external',
  'function tokenIdsOfOwner(address _owner) external view returns (uint32[] memory)',
  'function getAavegotchi(uint256 _tokenId) external view returns (tuple(uint256 tokenId, string name, address owner, uint256 randomNumber, uint256 status, int16[6] numericTraits, int16[6] modifiedNumericTraits, uint16[16] equippedWearables, address collateral, address escrow, uint256 stakedAmount, uint256 minimumStake, uint256 kinship, uint256 lastInteracted, uint256 experience, uint256 toNextLevel, uint256 usedSkillPoints, uint256 level, uint256 hauntId, uint256 baseRarityScore, uint256 modifiedRarityScore, bool locked, tuple(uint256 balance, uint256 itemId, uint256[] itemBalances)[] items))',
])

export type LogEntry = { timestamp: number; level: 'info' | 'warn' | 'error'; message: string }

export interface RunPettingOptions {
  force?: boolean
  privateKey: string
  petterAddress: string
  baseRpcUrl: string
}

export interface RunPettingResult {
  success: boolean
  message: string
  petted?: number
  transactionHash?: string
  blockNumber?: number
}

export async function runPetting(options: RunPettingOptions): Promise<RunPettingResult> {
  const { force = false, privateKey, petterAddress, baseRpcUrl } = options

  const logs: LogEntry[] = []
  const log = (level: LogEntry['level'], msg: string) => {
    logs.push({ timestamp: Date.now(), level, message: msg })
  }

  log('info', `Starting run (force=${force})`)

  const [botState, pettingIntervalHours] = await Promise.all([
    getBotState(),
    getPettingIntervalHours(),
  ])
  log('info', `Petting interval: ${pettingIntervalHours}h`)

  if (!botState?.running && !force) {
    log('info', 'Bot is stopped. Skipping. Start the bot in the dashboard to run on schedule.')
    await addWorkerLogs(logs)
    await setBotState({
      ...botState!,
      lastRun: Date.now(),
      lastRunMessage: 'Bot stopped, skipped',
    })
    return { success: true, message: 'Bot stopped, skipped', petted: 0 }
  }

  const transport = http(baseRpcUrl)
  const publicClient = createPublicClient({ chain: base, transport })
  const account = privateKeyToAccount(privateKey as `0x${string}`)
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport,
  })

  const delegatedOwners = await getDelegatedOwners()
  const delegatedLower = delegatedOwners
    .filter((o): o is string => typeof o === 'string' && o.length > 0)
    .map((o) => o.toLowerCase())
  const ownersToCheck = [...new Set([petterAddress.toLowerCase(), ...delegatedLower])]
  log('info', `Checking ${ownersToCheck.length} owner(s) for gotchis`)

  const allTokenIds: string[] = []
  for (const owner of ownersToCheck) {
    try {
      const tokenIds = await publicClient.readContract({
        address: AAVEGOTCHI_DIAMOND,
        abi: AAVEGOTCHI_ABI,
        functionName: 'tokenIdsOfOwner',
        args: [owner as `0x${string}`],
      })
      const ids = (tokenIds || []).map((id: bigint) => id.toString())
      allTokenIds.push(...ids)
      log('info', `Owner ${owner.slice(0, 10)}...: ${ids.length} gotchi(s)`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log('error', `tokenIdsOfOwner(${owner.slice(0, 10)}...): ${msg}`)
    }
  }

  if (allTokenIds.length === 0) {
    const msg =
      delegatedOwners.length > 0
        ? 'No Aavegotchis found for delegated owners'
        : 'No delegated owners or Aavegotchis found'
    log('info', msg)
    await addWorkerLogs(logs)
    await setBotState({ ...botState!, lastRun: Date.now(), lastRunMessage: msg })
    return { success: true, message: msg, petted: 0 }
  }

  let readyToPet: string[] = []
  if (force) {
    readyToPet = [...allTokenIds]
  } else {
    const block = await publicClient.getBlock({ blockTag: 'latest' })
    const currentTimestamp = block?.timestamp ?? BigInt(Math.floor(Date.now() / 1000))
    let anyNeedsKinship = false
    for (const tokenId of allTokenIds) {
      try {
        const gotchi = await publicClient.readContract({
          address: AAVEGOTCHI_DIAMOND,
          abi: AAVEGOTCHI_ABI,
          functionName: 'getAavegotchi',
          args: [BigInt(tokenId)],
        })
        const lastInteracted = Number((gotchi as any).lastInteracted)
        const hoursSince = (Number(currentTimestamp) - lastInteracted) / 3600
        if (hoursSince >= pettingIntervalHours) {
          anyNeedsKinship = true
          break
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        log('warn', `getAavegotchi(${tokenId}): ${msg}`)
      }
    }
    if (anyNeedsKinship) {
      readyToPet = [...allTokenIds]
    }
  }

  if (readyToPet.length === 0) {
    const msg = force
      ? 'No Aavegotchis to pet.'
      : `No Aavegotchis ready for kinship (${pettingIntervalHours}h cooldown). Checked ${allTokenIds.length} gotchis.`
    log('info', msg)
    await addWorkerLogs(logs)
    await setBotState({ ...botState!, lastRun: Date.now(), lastRunMessage: msg })
    return { success: true, message: msg, petted: 0 }
  }

  log('info', `Petting ${readyToPet.length} gotchi(s)`)

  try {
    const hash = await walletClient.writeContract({
      address: AAVEGOTCHI_DIAMOND,
      abi: AAVEGOTCHI_ABI,
      functionName: 'interact',
      args: [readyToPet.map((id) => BigInt(id))],
      account,
    })

    if (!hash) {
      throw new Error('Transaction hash is null')
    }

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    const gasCostWei =
      receipt.gasUsed && receipt.effectiveGasPrice
        ? (receipt.gasUsed * receipt.effectiveGasPrice).toString()
        : undefined

    log('info', `Tx ${hash} confirmed`)

    await addTransaction({
      hash,
      timestamp: Date.now(),
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
      gasCostWei,
      tokenIds: readyToPet,
    })
    await addWorkerLogs(logs)
    await setBotState({
      ...botState!,
      running: true,
      lastRun: Date.now(),
      lastError: undefined,
      lastRunMessage: `Petted ${readyToPet.length} Aavegotchi(s)`,
    })

    return {
      success: true,
      message: `Petted ${readyToPet.length} Aavegotchi(s)`,
      petted: readyToPet.length,
      transactionHash: hash,
      blockNumber: Number(receipt.blockNumber),
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log('error', `Transaction failed: ${msg}`)
    await addWorkerLogs(logs)
    await addError({
      id: Date.now().toString(),
      timestamp: Date.now(),
      message: msg,
      type: 'PettingError',
    })
    await setBotState({
      ...botState!,
      lastError: msg,
      lastRunMessage: undefined,
    })
    throw err
  }
}
