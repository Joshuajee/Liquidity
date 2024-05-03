import SwapInput from "@/components/SwapInput"
import Web3Btn from "@/components/Web3Btn"
import useCurrentChainId from "@/hooks/useCurrentChain"
import { IToken } from "@/lib/interfaces"
import { useState } from "react"

const SwapPage = () => {

    const [tokenA, setTokenA] = useState<IToken>()
    const [tokenB, setTokenB] = useState<IToken>()

    const chainId = useCurrentChainId()

    console.log({chainId})

    const swap = () => {

    }

    return (
        <div className="flex justify-center items-center h-full w-full">

            <div className="w-[500px] border-[1px] mt-20 border-white rounded-3xl p-4">
                <h2>Swap</h2>

                <SwapInput selected={tokenA} setSelected={setTokenA} />

                <SwapInput selected={tokenB} setSelected={setTokenB} />

                <Web3Btn onClick={swap}>Swap</Web3Btn>

            </div>

        </div>
    )
}

export default SwapPage