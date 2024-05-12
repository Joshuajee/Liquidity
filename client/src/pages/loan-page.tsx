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

    const { data, refetch } = useReadContract({
        abi: FactoryAbi,
        address: FACTORY,
        functionName: "getUserLoans",
        args: [address, collateral],
        chainId: chain.id,
        account: address
    })

    return (
        <div className="h-full w-full px-10 pt-20">

            <div className="flex justify-center w-full">

                <div className="border-white bg-black border-2 w-4/5 p-4 rounded-xl">

                    <h2 className="text-center font-bold text-2xl">Loans</h2>


                    <div className="flex gap-4 flex-wrap">

                        {
                            (data as ILoan[])?.map((loan, index) => {
                                return (
                                    <LoanCard 
                                        key={index} 
                                        loan={loan} 
                                        index={index} 
                                        collateral={collateral as Address}
                                        refetch={refetch}
                                        />
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