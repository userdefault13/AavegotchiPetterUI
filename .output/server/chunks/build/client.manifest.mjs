const client_manifest = {
  "_QHNtm79a.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "QHNtm79a.js",
    "name": "index",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ],
    "dynamicImports": [
      "node_modules/viem/_esm/utils/ccip.js",
      "node_modules/@noble/curves/esm/secp256k1.js"
    ]
  },
  "node_modules/@noble/curves/esm/secp256k1.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "CaTB3BL6.js",
    "name": "secp256k1",
    "src": "node_modules/@noble/curves/esm/secp256k1.js",
    "isDynamicEntry": true,
    "imports": [
      "_QHNtm79a.js",
      "node_modules/nuxt/dist/app/entry.js"
    ]
  },
  "node_modules/nuxt/dist/app/components/error-404.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "DzOpm0mF.js",
    "name": "error-404",
    "src": "node_modules/nuxt/dist/app/components/error-404.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ],
    "css": []
  },
  "error-404.MksMKVWr.css": {
    "file": "error-404.MksMKVWr.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "node_modules/nuxt/dist/app/components/error-500.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "DYSN9uda.js",
    "name": "error-500",
    "src": "node_modules/nuxt/dist/app/components/error-500.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ],
    "css": []
  },
  "error-500.DOWD7OuR.css": {
    "file": "error-500.DOWD7OuR.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "node_modules/nuxt/dist/app/entry.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "Cq24avcm.js",
    "name": "entry",
    "src": "node_modules/nuxt/dist/app/entry.js",
    "isEntry": true,
    "dynamicImports": [
      "_QHNtm79a.js",
      "node_modules/nuxt/dist/app/components/error-404.vue",
      "node_modules/nuxt/dist/app/components/error-500.vue"
    ],
    "_globalCSS": true
  },
  "node_modules/viem/_esm/utils/ccip.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "Cs5VIxZr.js",
    "name": "ccip",
    "src": "node_modules/viem/_esm/utils/ccip.js",
    "isDynamicEntry": true,
    "imports": [
      "_QHNtm79a.js",
      "node_modules/nuxt/dist/app/entry.js"
    ]
  }
};

export { client_manifest as default };
//# sourceMappingURL=client.manifest.mjs.map
