import { useReadContract } from "wagmi"
import { useEffect, useState } from "react"
import useCurrentChain from "./useCurrentChain"
import { Address } from "viem"
import LSwapAbi from "@/abi/contracts/LSwapPair.sol/LSwapPair.json"
import { sortTokens } from "@/lib/utils"

const useAmmPrice = (pair: Address, tokenIn: Address, amountIn: bigint, tokenOut: Address) => {

    const [amountOut, setAmountOut] = useState(0n)

    const [tokenA] = sortTokens(tokenIn, tokenOut);

    const chain = useCurrentChain()

    const { data, isError, error, isSuccess } =  useReadContract({
        abi: LSwapAbi,
        address: pair,
        functionName: "getReserves",
        chainId: chain.id,
    })

    useEffect(() => {
        if (data) {
            const [reserve0, reserve1] = data as bigint[]
            if (tokenA === tokenIn) {
                setAmountOut(reserve1 * amountIn / reserve0)
            } else {
                setAmountOut(reserve0 * amountIn / reserve1)
            }
        }
    }, [data, tokenA, tokenIn, amountIn])

    useEffect(() => {
        if (isError) {
            //toast.error(String(error?.shortMessage))
        }
        if (isSuccess) {
            console.log("AmmPools: ", data)
        }
    }, [isSuccess, isError, error, data])

    return { amountOut }
}

export default useAmmPrice