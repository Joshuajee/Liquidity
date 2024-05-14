import { useAccount } from "wagmi"
import { Address } from "viem"
import { useMemo, useState } from "react"
import { getTokenName, weiToCurrency } from "@/lib/utils"
import { ILoan } from "@/pages/loan-page"
import { FACTORY, YEAR } from "@/lib/constants"
import Web3BtnSM from "./Web3BtnSM"
import { toast } from "react-toastify"
import useViemClient from "@/hooks/useViemClient"
import FactoryAbi from "@/abi/contracts/LFactory.sol/LFactory.json"
import useTokenApproval from "@/hooks/useTokenApproval"


interface IProps {
    index: number;
    loan: ILoan;
    collateral: Address;
    refetch: () => void;
}

const LoanCard = ({ loan, collateral, index, refetch } : IProps) => {

    const { publicClient, walletClient } = useViemClient()
    const { address } = useAccount() 
    const { tokenBorrowed, amount, borrowedAt, interestRate, accruedInterest } = loan

    const approval = useTokenApproval(tokenBorrowed, FACTORY)

    const [loading, setLoading] = useState(false)


    const interest = useMemo(() => {
        const timeDelta = BigInt(parseInt(String(Date.now() / 1000)) + 3600 - borrowedAt)
        const currentInterest = ((amount * timeDelta * BigInt(interestRate)) / BigInt(YEAR))
        return BigInt(accruedInterest + currentInterest) 
    }, [accruedInterest, amount, interestRate, borrowedAt])

    const collateralSymbol = useMemo(() => getTokenName(collateral), [collateral])


    const repay = async () => {
        setLoading(true)
        try {
            const { request } = await publicClient.simulateContract({
                address: FACTORY,
                abi: FactoryAbi,
                functionName: 'repayFull',
                account: address,
                args: [address, collateral, tokenBorrowed, index]
            })
            await walletClient.writeContract(request)
            toast.success("Repay successful")
            refetch()
            close()
        } catch (e) {
            toast.error((e as any)?.shortMessage)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    let text = "Repay"

    if ((approval as any)?.allowance < (interest + amount) * 2n) {
        text = "Approve " 
    } 

    const handleClick = () => {
        if ((approval as any)?.allowance < (interest + amount) * 2n) {
            approval.createAllowance()
        }  else {
            repay()
        }
    }

    return (
        <>
            <div className="flex min-w-[250px] flex-col gap-2 font-bold p-3 bg-[#383838]  rounded-xl my-3">
                                    
                <h3 className="text-center"> {collateralSymbol} </h3>

                <div className="flex flex-col items-center">
                    <p>Current Debt: {weiToCurrency(amount)} {collateralSymbol}</p>
                    <p>Total Debt: {weiToCurrency(amount + interest)} {collateralSymbol}</p>
                    <p>Interest: {weiToCurrency(interest)} {collateralSymbol}</p>
                </div>


                <div className="flex justify-center gap-3">

                    <div className="w-40">
                        <Web3BtnSM loading={loading} onClick={handleClick}>{text}</Web3BtnSM>
                    </div>

                </div>

            </div>

        </>
    )
}


export default LoanCard