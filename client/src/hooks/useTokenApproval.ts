import { Address, maxUint256  } from "viem"
import { useAccount, useReadContract } from "wagmi"
import TokenAbi from "@/abi/contracts/mocks/MockERC20.sol/MockERC20.json"
import { ROUTER } from "@/lib/constants"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import useViemClient from "./useViemClient"
import useCurrentChain from "./useCurrentChain"

const useTokenApproval = (token?: Address, contract?: Address) => {

    const [loading, setLoading] = useState(false)

    const { publicClient, walletClient } = useViemClient()

    const { address } = useAccount()

    const chain = useCurrentChain()

    const allowance = useReadContract({
        abi: TokenAbi,
        address: token,
        functionName: "allowance",
        args: [address, contract ? contract : ROUTER],
        chainId: chain.id,
        account: address
    })

    const createAllowance = async () => {
        
        try {

            setLoading(true)

            const { request } = await publicClient.simulateContract({
                address: token as Address,
                abi:TokenAbi,
                functionName: 'approve',
                args:  [contract ? contract : ROUTER, maxUint256],
                account: address,
                chain
            })

            await walletClient.writeContract(request)
        } catch (e) {
            toast.error("Error creating allowance")
            console.error(e)
        } finally {
            setLoading(false)
            allowance.refetch()
        }

    }

    useEffect(() => {
        if (allowance.isError) {
            toast.error(String(allowance?.error?.shortMessage))
        }
        if (allowance.isSuccess) {
            console.log("Allowance: ", allowance.data)
        }
    }, [allowance])


    return {allowance: allowance.data, loading, createAllowance}
}

export default useTokenApproval