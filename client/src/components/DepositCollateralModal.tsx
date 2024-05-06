import { Address, parseEther } from "viem";
import Web3Btn from "./Web3Btn";
import useTokenApproval from "@/hooks/useTokenApproval";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { ROUTER } from "@/lib/constants";
import useViemClient from "@/hooks/useClients";
import RouterAbi from "@/abi/contracts/periphery/LRouter.sol/LRouter.json"
import { useAccount } from "wagmi";

interface IProps {
    token: Address;
    symbol: string;
    close: () => void;
}

const DepositCollateralModal = ({ token, close } : IProps) => {

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
                args: [token, valueToWei, address],
                account: address
            })

            await walletClient.writeContract(request)

            toast.success("Deposit successful")

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
            depositCollateral()
        }
     
    }

    let text = "Deposit"


    if (Number(value) <= 0) {
        text = "Enter valid number"
    }  else  if ((approval as any)?.allowance < valueToWei) {
        text = "Approve"
    } 



    return (
        <div className="border-white bg-black border-2 w-[450px] h-[200px] p-4 rounded-xl">

            <div className="flex w-full justify-between mb-5 mt-2">
                <h2>Deposit Collateral</h2>
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

export default DepositCollateralModal