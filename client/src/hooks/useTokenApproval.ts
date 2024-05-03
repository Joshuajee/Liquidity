import { Address, parseEther } from "viem"
import { useAccount, useReadContract } from "wagmi"
import TokenAbi from "@/abi/contracts/mocks/MockERC20.sol/MockERC20.json"
import { ROUTER } from "@/lib/constants"
import { useEffect } from "react"
import { toast } from "react-toastify"
import useViemClient from "./useClients"
import useCurrentChain from "./useCurrentChain"

const useTokenApproval = (token?: Address) => {

    const { publicClient, walletClient } = useViemClient()

    const { address } = useAccount()

    const chain = useCurrentChain()

    const allowance = useReadContract({
        abi: TokenAbi,
        address: token,
        functionName: "allowance",
        args: [address, ROUTER],
        chainId: chain.id,
        account: address
    })

    const createAllowance = async () => {

        const disired = parseEther("100000000000", "wei")

        const { request } = await publicClient.simulateContract({
            address: token as Address,
            abi:TokenAbi,
            functionName: 'approve',
            args:  [ROUTER, disired],
            account: address,
            chain
          })

        await walletClient.writeContract(request)

        allowance.refetch()

    }

    useEffect(() => {
        if (allowance.isError) {
            toast.error(String(allowance?.error?.shortMessage))
        }
        if (allowance.isSuccess) {
            console.log("Allowance: ", allowance.data)
        }
    }, [allowance])


    return {allowance: allowance.data, createAllowance}
}

export default useTokenApproval