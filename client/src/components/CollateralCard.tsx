import { useAccount, useReadContract } from "wagmi"
import CollateralAbi from "@/abi/contracts/LCollateralPool.sol/LCollateralPool.json"
import useCurrentChain from "@/hooks/useCurrentChain"
import FactoryAbi from "@/abi/contracts/LFactory.sol/LFactory.json"
import { Address } from "viem"
import { useMemo, useState } from "react"
import ModalWrapper from "./ModalWrapper"
import LendingModal from "./LendingModal"
import { getTokenName, weiToCurrency, weiToEther } from "@/lib/utils"
import { FACTORY } from "@/lib/constants"
import { useNavigate } from "react-router-dom"


const CollateralCard = ({ collateralToken, tokenToBorrow } : { collateralToken: Address, tokenToBorrow: Address }) => {

    const navigate = useNavigate()
    const { address } = useAccount() 
    const chain = useCurrentChain()

    const collateralSymbol = useMemo(() => getTokenName(collateralToken), [collateralToken])

    const [deposit, setDeposit] = useState(false)
    const [withdraw, setWithdraw] = useState(false)
    const [borrow, setBorrow] = useState(false)

    const collateralPool = useReadContract({
        abi: FactoryAbi,
        address: FACTORY,
        functionName: "getCollateralPool",
        args: [collateralToken],
        account: address,
        chainId: chain?.id
    })

    const loanStats = useReadContract({
        abi: FactoryAbi,
        address: FACTORY,
        functionName: "getLoanStats",
        args: [address, collateralToken],
        account: address,
        chainId: chain?.id
    })

    const ammPool = useReadContract({
        abi: FactoryAbi,
        address: FACTORY,
        functionName: "getPool",
        args: [collateralToken, tokenToBorrow],
        account: address,
        chainId: chain?.id
    })

    const balanceOf = useReadContract({
        abi: CollateralAbi,
        functionName: "balanceOf",
        address: collateralPool.data as Address,
        args: [address],
        account: address,
        chainId: chain?.id
    })

    const balance = (balanceOf as any).data || 0n

    const handleClose = () => {
        setDeposit(false)
        setWithdraw(false)
        setBorrow(false)
        balanceOf.refetch()
        loanStats.refetch()
    }

    const loanData = loanStats.data as bigint[]

    console.log("AMM: ", ammPool?.data)

    console.log("LOAN", loanStats)


    return (
        <>
            <div className="flex w-[450px] flex-col gap-2 font-bold p-3 bg-[#383838]  rounded-xl my-3">
                                    
                <h3 className="text-center"> {collateralSymbol} </h3>

                <div className="flex justify-between">
                    <p>Collateral: {weiToCurrency(balance)} {collateralSymbol}</p>
                    <p>Total Debt: {loanData ? weiToCurrency(loanData?.[1] + loanData?.[2]) : 0 } {collateralSymbol}</p>
                </div>

                <div className="flex justify-between">
                    <p>Total Interest:    {loanData ? weiToCurrency(loanData?.[2]) : 0 }  {collateralSymbol}</p>
                    <p>Total Loans:       {loanData ? loanData?.[3].toString() : 0 } </p>
                </div>

                <p className="text-center">Total LTV:  {loanData ? Number(weiToEther(loanData?.[0] * 1000n)) / 1000 : 0} </p>

                <div className="flex justify-center gap-3">

                    <button 
                        onClick={() => setDeposit(true)}
                        className="bg-blue-700 px-3 w-36 py-2">
                        Deposit
                    </button>

                    <button 
                        className="bg-green-700 px-3 w-36 py-2">
                        Withdraw
                    </button>

                </div>

                <div className="flex justify-center gap-3">

                    <button 
                        onClick={() => setBorrow(true)}
                        className="bg-green-700 px-3 w-36 py-2 rounded-lg">
                        Borrow
                    </button>

                    <button 
                        onClick={() => navigate("/loans/"+ collateralToken)}
                        className="bg-blue-700 px-3 w-36 py-2 rounded-lg">
                        View Loans
                    </button>

                </div>

            </div>

            <ModalWrapper open={deposit} close={handleClose}>
                <LendingModal type="deposit" symbol={""} collateral={collateralToken} token={tokenToBorrow as Address} close={handleClose} />
            </ModalWrapper>

            <ModalWrapper open={withdraw} close={handleClose}>
                <LendingModal type="withdraw" symbol="" collateral={collateralToken} token={tokenToBorrow as Address} close={handleClose} />
            </ModalWrapper>

            <ModalWrapper open={borrow} close={handleClose}>
                <LendingModal type="borrow" symbol="" collateral={collateralToken} token={tokenToBorrow as Address} close={handleClose} />
            </ModalWrapper>

        </>
    )
}


export default CollateralCard