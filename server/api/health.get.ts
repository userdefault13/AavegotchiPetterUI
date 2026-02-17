import { getBotState, getTransactions, getErrors } from '~/lib/kv'

export default defineEventHandler(async () => {
  try {
    const [state, transactions, errors] = await Promise.all([
      getBotState(),
      getTransactions(100),
      getErrors(100),
    ])

    const totalPetted = transactions.reduce((sum, tx) => sum + tx.tokenIds.length, 0)
    const last24h = transactions.filter(
      (tx) => Date.now() - tx.timestamp < 24 * 60 * 60 * 1000
    ).length
    const errorsLast24h = errors.filter(
      (e) => Date.now() - e.timestamp < 24 * 60 * 60 * 1000
    ).length

    const totalGasCostWei = transactions.reduce((sum, tx) => {
      const wei = tx.gasCostWei ? BigInt(tx.gasCostWei) : 0n
      return sum + wei
    }, 0n)
    const totalGasCostEth = Number(totalGasCostWei) / 1e18

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'aavegotchi-petter-dashboard',
      bot: {
        running: state?.running ?? false,
        lastRun: state?.lastRun ? new Date(state.lastRun).toISOString() : null,
        lastError: state?.lastError ?? null,
        lastRunMessage: state?.lastRunMessage ?? null,
      },
      stats: {
        totalTransactions: transactions.length,
        totalAavegotchisPetted: totalPetted,
        transactionsLast24h: last24h,
        errorsLast24h,
        totalGasCostEth,
        successRate:
          transactions.length + errors.length > 0
            ? Math.round(
                (transactions.length / (transactions.length + errors.length)) * 100
              )
            : 100,
      },
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Health check failed',
    })
  }
})
