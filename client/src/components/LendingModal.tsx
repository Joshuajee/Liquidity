import { Address, parseEther } from "viem";
import Web3Btn from "./Web3Btn";
import useTokenApproval from "@/hooks/useTokenApproval";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { FACTORY, ROUTER } from "@/lib/constants";
import useViemClient from "@/hooks/useClients";
import RouterAbi from "@/abi/contracts/periphery/LRouter.sol/LRouter.json"
import FactoryAbi from "@/abi/contracts/LFactory.sol/LFactory.json"
import { useAccount } from "wagmi";

interface IProps {
    collateral?: Address;
    token: Address;
    symbol: string;
    type: "deposit" | "withdraw" | "borrow" | "repay";
    close: () => void;
}

const LendingModal = ({ token, type, collateral, close } : IProps) => {

    const { publicClient, walletClient } = useViemClient()

    const { address } = useAccount()

    const [value, setValue] = useState("")
    const [loading, setLoading] = useState(false)

    const approval = useTokenApproval(token)

    const valueToWei =  parseEther(value, "wei")

    const depositCollateral = async () => {
        setLoading(true)
        try {
            const { request } = await publicClient.simulateContract({
                address: ROUTER,
                abi: RouterAbi,
                functionName: 'depositCollateral',
                args: [collateral, valueToWei, address],
                account: address
            })
            await walletClient.writeContract(request)
            toast.success("Deposit successful")
            close()
        } catch (e) {
            toast.error((e as any)?.shortMessage)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }


    const borrowCollateral = async () => {
        setLoading(true)
        try {
            const { request } = await publicClient.simulateContract({
                address: FACTORY,
                abi: FactoryAbi,
                functionName: 'borrow',
                args: [collateral, token, valueToWei],
                account: address
            })
            await walletClient.writeContract(request)
            toast.success("Borrow successful")
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
        }  else if (type === "deposit")  {
            depositCollateral()
        } else if (type === "borrow")  {
            borrowCollateral()
        } else if (type === "repay")  {
            borrowCollateral()
        } else if (type === "withdraw")  {
            borrowCollateral()
        }
     
    }

    const getTitle = () => {
        switch (type) {
            case "deposit":
                return "Deposit Collateral"
            case "borrow":
                return "Borrow "
            default:
                return ""
        }

    }

    let text = getTitle()

    if (Number(value) <= 0) {
        text = "Enter valid number"
    }  else  if ((approval as any)?.allowance < valueToWei) {
        text = "Approve"
    } 



    return (
        <div className="border-white bg-black border-2 w-[450px] h-[200px] p-4 rounded-xl">

            <div className="flex w-full justify-between mb-5 mt-2">
                <h2>{getTitle()}</h2>
                <button onClick={close}>X</button>
            </div>

            <input 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
                className="indent-4 font-bold text-white outline-1 w-full border-[1px] bg-inherit h-12"
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

export default LendingModal