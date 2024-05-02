
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { liskSepolia, localhost } from 'viem/chains'
import useCurrentChainId from './useCurrentChainId'
 

const useViemClient = () => {

    const chainId = useCurrentChainId()

    const publicClient = createPublicClient({
        chain: chainId === localhost.id ? localhost : liskSepolia,
        transport: http()
    })

    const walletClient = createWalletClient({
        chain: chainId === localhost.id ? localhost : liskSepolia,
        transport: custom((window as any)?.ethereum)
    })
       

    return { publicClient, walletClient }
}



export default useViemClient