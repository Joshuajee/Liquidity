import { Address, parseEther } from "viem";
import Web3Btn from "../Web3Btn";
import useTokenApproval from "@/hooks/useTokenApproval";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { ROUTER } from "@/lib/constants";
import useViemClient from "@/hooks/useViemClient";
import RouterAbi from "@/abi/contracts/periphery/LRouter.sol/LRouter.json"
import { useAccount } from "wagmi";

interface IProps {
    pool: Address;
    close: () => void;
}

const RemoveLiquidityModal = ({ pool, close } : IProps) => {

    const { publicClient, walletClient } = useViemClient()

    const { address } = useAccount()

    const [value, setValue] = useState("")
    const [loading, setLoading] = useState(false)

    const approval = useTokenApproval(pool)

    const valueToWei =  parseEther(value, "wei")

    const remove = async () => {
        setLoading(true)
        try {
            const { request } = await publicClient.simulateContract({
                address: ROUTER,
                abi: RouterAbi,
                functionName: 'removeLiquidityPair',
                args: [
                    pool,
                    valueToWei, 0n, 0n, address,
                    parseInt((Date.now() * 2 /1000).toString())
                ],
                account: address
            })
            await walletClient.writeContract(request)
            toast.success("Liquidity Removed")
            close()
        } catch (e) {
            toast.error((e as any)?.shortMessage)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }


    const handleClick = () => {
        if (Number(value) <= 0) {
            toast.error("Value must be greated than zero")
        }  else  if ((approval as any)?.allowance < valueToWei) {
            approval.createAllowance()
        }  else {
            remove()
        }
     
    }

    let text = "Remove Liquidity"

    if (Number(value) <= 0) {
        text = "Enter valid number"
    }  else  if ((approval as any)?.allowance < valueToWei) {
        text = "Approve"
    } 



    return (
        <div className="border-white bg-black border-2 w-[450px] h-[220px] p-4 rounded-xl">

            <div className="flex w-full justify-between mb-5 mt-2">
                <h2>{text}</h2>
                <button onClick={close}>X</button>
            </div>

            <input 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
                className="indent-4 h-14 text-2xl text-center font-bold text-white outline-1 w-full border-[1px] bg-inherit"
                name="collateral" 
                type="number" 
                placeholder="Enter amount" />


            <div className="my-3">

                <Web3Btn 
                    // disabled={text != "Deposit"}
                    onClick={handleClick}
                    loading={approval.loading || loading}>
                    {text}
                </Web3Btn>

            </div>

        </div>
    )
}

export default RemoveLiquidityModal