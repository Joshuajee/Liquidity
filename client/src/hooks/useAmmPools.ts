import { useAccount, useReadContract } from "wagmi"
import { ROUTER } from "@/lib/constants"
import { useEffect } from "react"
import { toast } from "react-toastify"
import useCurrentChain from "./useCurrentChain"
import RouterAbi from "@/abi/contracts/periphery/LRouter.sol/LRouter.json"

const useAmmPools = () => {

    const { address } = useAccount()

    const chain = useCurrentChain()

    const { data, isError, error, isSuccess } = useReadContract({
        abi: RouterAbi,
        address: ROUTER,
        functionName: "getAmmPools",
        args: [address],
        chainId: chain.id,
        account: address
    })

    useEffect(() => {
        if (isError) {
            toast.error(String(error?.shortMessage))
        }
        if (isSuccess) {
            console.log("AmmPools: ", data)
        }
    }, [isSuccess, isError, error, data])

    return data
}

export default useAmmPools