import SwapInput from "@/components/SwapInput"
import Web3Btn from "./Web3Btn"
import { useEffect, useState } from "react"
import { IToken } from "@/lib/interfaces"
import { useAccount, useReadContract } from "wagmi"
import { FACTORY, ROUTER } from "@/lib/constants"
import FactoryAbi from "@/abi/contracts/LFactory.sol/LFactory.json"
import useCurrentChainId from "@/hooks/useCurrentChainId"
import { toast } from "react-toastify"
import { parseEther, zeroAddress } from "viem"
import RouterAbi from "@/abi/contracts/periphery/LRouter.sol/LRouter.json"
import useViemClient from "@/hooks/useClients"

const AddLiquidity = () => {

    const { address } = useAccount()

    const { publicClient, walletClient } = useViemClient()

    const [created, setCreated] = useState<boolean>()

    const [tokenA, setTokenA] = useState<IToken>()
    const [tokenB, setTokenB] = useState<IToken>()

    const chainId = useCurrentChainId()

    const pair = useReadContract({
        abi: FactoryAbi,
        address: FACTORY,
        functionName: "getToken",
        args: [tokenA, tokenB],
        chainId,
    })

    useEffect(() => {
        if (pair.isError) {
            toast.error(String(pair?.error))
        }
        if (pair.isSuccess) {
            if (pair.data == zeroAddress) {
                setCreated(false)
            } else {
                setCreated(true)
            }
        }
    }, [pair])

    const text = (!tokenA || !tokenB) ? "Select Tokens" : created ? "Add Liquidity" : "Create Pair"


    const addLiquidity = async () => {
        const disired = parseEther("10", "wei")

        const { request } = await publicClient.simulateContract({
            address: ROUTER,
            abi: RouterAbi,
            functionName: 'addLiquidity',
            args:  [[tokenA?.address, tokenB?.address, disired, disired, 0, 0, address, parseInt((Date.now() / 1000).toString()) + 3600]],
            account: address
          })

        await walletClient.writeContract(request)

    }

    return (
        <div className="flex justify-center items-center h-full w-full">

            <div className="w-[500px] border-[1px] mt-20 border-white rounded-3xl p-4">
                
                <h2>Add Liquidity</h2>

                <SwapInput selected={tokenA} setSelected={setTokenA} />

                <SwapInput selected={tokenB} setSelected={setTokenB} />

                <Web3Btn onClick={addLiquidity} loading={pair.isLoading}>{text}</Web3Btn>

            </div>

        </div>
    )
}

export default AddLiquidity