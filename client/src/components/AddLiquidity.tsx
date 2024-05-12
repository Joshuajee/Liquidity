import SwapInput from "@/components/SwapInput"
import Web3Btn from "./Web3Btn"
import { useEffect, useState } from "react"
import { IToken } from "@/lib/interfaces"
import { useAccount, useReadContract } from "wagmi"
import { FACTORY, ROUTER } from "@/lib/constants"
import FactoryAbi from "@/abi/contracts/LFactory.sol/LFactory.json"
import { toast } from "react-toastify"
import { Address, parseEther, zeroAddress } from "viem"
import RouterAbi from "@/abi/contracts/periphery/LRouter.sol/LRouter.json"
import useViemClient from "@/hooks/useViemClient"
import useTokenApproval from "@/hooks/useTokenApproval"
import useCurrentChain from "@/hooks/useCurrentChain"
import useAmmPrice from "@/hooks/useAmmPrice"
import { weiToEther } from "@/lib/utils"

const AddLiquidity = () => {

    const { address } = useAccount()

    const { publicClient, walletClient } = useViemClient()

    const [tokenA, setTokenA] = useState<IToken>()
    const [tokenB, setTokenB] = useState<IToken>()

    const [valueA, setValueA] = useState("")
    const [valueB, setValueB] = useState("")

    const valueAToWei = parseEther(valueA.toString(), "wei")
    const valueBToWei = parseEther(valueB.toString(), "wei")

    const [loading, setLoading] = useState(false)

    const approvalA = useTokenApproval(tokenA?.address)
    const approvalB = useTokenApproval(tokenB?.address)
    

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
        if (pair.data && pair.data != zeroAddress) setValueB(weiToEther(amountOut))
    }, [amountOut, pair.data])

    let text = (!tokenA || !tokenB) ? "Select Tokens" : pair.data != zeroAddress ? "Add Liquidity" : "Create Pair"


    if ((approvalA as any)?.allowance < valueAToWei) {
        text = "Approve " + tokenA?.name

    } else if ((approvalB as any)?.allowance < valueBToWei) {
        text = "Approve " + tokenB?.name
    }


    const addLiquidity = async () => {

        const slippage = 50n

        setLoading(true)

        try {

            const { request } = await publicClient.simulateContract({
                address: ROUTER,
                abi: RouterAbi,
                functionName: 'addLiquidity',
                args: [
                    [
                        tokenA?.address, tokenB?.address, 
                        valueAToWei, valueBToWei, 
                        valueAToWei * slippage / 100n, 
                        valueBToWei * slippage / 100n, 
                        address, 
                        Number(parseInt((Date.now() / 1000).toString())) * 3600
                    ]
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
        if ((approvalA as any)?.allowance < valueAToWei) {
            approvalA.createAllowance()
        }  else if ((approvalB as any)?.allowance < valueBToWei) {
            approvalB.createAllowance()
        }  else {
            addLiquidity()
        }
    }

    return (
        <div className="flex justify-center items-center h-full w-full">

            <div className="w-[500px] border-[1px] mt-20 border-white rounded-3xl p-4">
                
                <h2>Add Liquidity</h2>

                <SwapInput tag="You Pay" value={valueA} setValue={setValueA} selected={tokenA} setSelected={setTokenA} />

                <SwapInput tag="You Pay" value={valueB} setValue={setValueB}  selected={tokenB} setSelected={setTokenB} />

                <Web3Btn onClick={handleClick} loading={pair.isLoading || loading}>{text}</Web3Btn>

            </div>

        </div>
    )
}

export default AddLiquidity