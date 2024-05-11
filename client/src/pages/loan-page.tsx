import { FACTORY } from "@/lib/constants"
import { useParams } from "react-router-dom"
import { useAccount, useReadContract } from "wagmi"
import FactoryAbi from "@/abi/contracts/LFactory.sol/LFactory.json"
import useCurrentChain from "@/hooks/useCurrentChain"
import LoanCard from "@/components/LoanCard"
import { Address } from "viem"


export interface ILoan {
    accruedInterest: bigint;
    ammPool: Address;
    amount: bigint;
    borrowedAt: number;
    collateralPool: Address;
    interestRate: number;
    tokenBorrowed: Address;
}

const LoanPage = () => {

    
    const { collateral } = useParams()
    const { address } = useAccount()

    const chain = useCurrentChain()

    const { data } = useReadContract({
        abi: FactoryAbi,
        address: FACTORY,
        functionName: "getUserLoans",
        args: [address, collateral],
        chainId: chain.id,
        account: address
    })

    console.log({data})

    return (
        <div className="h-full w-full px-10 pt-20">

            <div className="flex justify-center w-full">

                <div className="border-white bg-black border-2 w-4/5 h-[400px] p-4 rounded-xl">

                    <h2>Loans</h2>


                    <div className="flex gap-4 justify-center">

                        {
                            (data as ILoan[])?.map((loan, index) => {
                                console.log({loan})
                                return (
                                    <LoanCard 
                                        key={index} 
                                        loan={loan} 
                                        index={index} 
                                        collateral={collateral} />
                                )
                            })
                        }

                    </div>

                </div>

            </div>

        </div>
    )
}

export default LoanPage