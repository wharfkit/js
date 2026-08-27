declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TESTNET_NODE_URL: string
            CONFORMANCE_CONTRACT_NAME: string
            CONFORMANCE_TESTNET_ACCOUNT: string
        }
    }
}

export {}
