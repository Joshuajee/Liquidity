
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import useCurrentChain from './useCurrentChain'
 

const useViemClient = () => {

    const chain = useCurrentChain()

    const publicClient = createPublicClient({
        chain,
        transport: http()
    })

    const walletClient = createWalletClient({
        chain,
        transport: custom((window as any)?.ethereum)
    })
       

    return { publicClient, walletClient }
}



export default useViemClient