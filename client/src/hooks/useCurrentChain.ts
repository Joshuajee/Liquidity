import { hardhat, liskSepolia } from "viem/chains"

const useCurrentChain = () => {

    if (import.meta.env.VITE_ENV === "prod") {
        return liskSepolia
    }

    return hardhat
}

export default useCurrentChain