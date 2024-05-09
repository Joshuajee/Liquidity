import SwapInput from "@/components/SwapInput"
import Web3Btn from "@/components/Web3Btn"
import useCurrentChain from "@/hooks/useCurrentChain"
import useTokenApproval from "@/hooks/useTokenApproval"
import { FACTORY, ROUTER } from "@/lib/constants"
import { IToken } from "@/lib/interfaces"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Address, parseEther, zeroAddress } from "viem"
import FactoryAbi from "@/abi/contracts/LFactory.sol/LFactory.json"
import { useAccount, useReadContract } from "wagmi"
import useViemClient from "@/hooks/useClients"
import RouterAbi from "@/abi/contracts/periphery/LRouter.sol/LRouter.json"
import useAmmPrice from "@/hooks/useAmmPrice"
import { weiToEther } from "@/lib/utils"


const SwapPage = () => {

    const { address } = useAccount()

    const { publicClient, walletClient } = useViemClient()

    const [tokenA, setTokenA] = useState<IToken>()
    const [tokenB, setTokenB] = useState<IToken>()

    const [valueA, setValueA] = useState("")
    const [valueB, setValueB] = useState("")

    const valueAToWei = parseEther(valueA.toString(), "wei")
    const valueBToWei = parseEther(valueB.toString(), "wei")

    const [loading, setLoading] = useState(false)

    const approval = useTokenApproval(tokenA?.address)

    const chain = useCurrentChain()

    const pair = useReadContract({
        abi: FactoryAbi,
        address: FACTORY,
        functionName: "getPool",
        args: [tokenA?.address, tokenB?.address],
        chainId: chain.id,
    })

    const { amountOut } = useAmmPrice(pair.data as Address, tokenA?.address as Address, valueAToWei, tokenB?.address as Address)

    useEffect(() => {
        if (pair.isError && tokenA && tokenB) {
            toast.error("Pair Does not Exist")
        }
    }, [pair, tokenA, tokenB])

    useEffect(() => {
        setValueB(weiToEther(amountOut))
    }, [amountOut])


    let text = (!tokenA || !tokenB) ? "Select Tokens" : pair.data === zeroAddress ? "Pair does not Exist" : "Swap"

    if ((approval as any)?.allowance < valueAToWei) {
        text = "Approve " + tokenA?.name
    } 

    const swap = async () => {
        const slippage = 60n
        setLoading(true)
        try {
            const { request } = await publicClient.simulateContract({
                address: ROUTER,
                abi: RouterAbi,
                functionName: 'swapExactTokenForToken',
                args: [
                    valueAToWei, 
                    valueBToWei * slippage / 100n, 
                    [tokenA?.address, tokenB?.address],
                    address, 
                    Date.now() * 2
                ],
                account: address
            })
            await walletClient.writeContract(request)
            setValueA("")
            setValueB("")
        } catch (e) {
            toast.error((e as any)?.shortMessage)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleClick = () => {
        if ((approval as any)?.allowance < valueAToWei) {
            approval.createAllowance()
        } else {
            swap()
        }
    }

    return (
        <div className="flex justify-center items-center h-full w-full">

            <div className="w-[500px] border-[1px] mt-20 border-white rounded-3xl p-4">

                <h2>Swap</h2>

                <SwapInput value={valueA} setValue={setValueA} selected={tokenA} setSelected={setTokenA} />

                <SwapInput value={valueB} setValue={setValueB} selected={tokenB} setSelected={setTokenB} />

                <Web3Btn onClick={handleClick} loading={loading}>{text}</Web3Btn>

            </div>

        </div>
    )
}

export default SwapPage