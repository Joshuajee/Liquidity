import { useAccount, useReadContract } from "wagmi"
import CollateralAbi from "@/abi/contracts/LCollateralPool.sol/LCollateralPool.json"
import useCurrentChain from "@/hooks/useCurrentChain"
import FactoryAbi from "@/abi/contracts/LFactory.sol/LFactory.json"
import { Address } from "viem"
import { useMemo, useState } from "react"
import ModalWrapper from "./ModalWrapper"
import LendingModal from "./LendingModal"
import { getTokenName, weiToCurrency } from "@/lib/utils"
import { FACTORY } from "@/lib/constants"
import LSwapPairAbi from "@/abi/contracts/LSwapPair.sol/LSwapPair.json"


const CollateralCard = ({ collateralToken, tokenToBorrow } : { symbol: string, collateralToken: Address, tokenToBorrow: Address }) => {

    const { address } = useAccount() 
    const chain = useCurrentChain()

    const collateralSymbol = useMemo(() => getTokenName(collateralToken), [collateralToken])

    const [deposit, setDeposit] = useState(false)
    const [borrow, setBorrow] = useState(false)
    const [withdraw, setWithdraw] = useState(false)

    const collateralPool = useReadContract({
        abi: FactoryAbi,
        address: FACTORY,
        functionName: "getCollateralPool",
        args: [collateralToken],
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

    const balanceOfAmm = useReadContract({
        abi: LSwapPairAbi,
        functionName: "balanceOf",
        address: ammPool.data as Address,
        args: [address],
        account: address,
        chainId: chain?.id
    })

    const balance = (balanceOf as any).data || 0n

    const ammBalance = (balanceOfAmm as any).data || 0n

    const handleClose = () => {
        setDeposit(false)
        setWithdraw(false)
        setBorrow(false)
        balanceOf.refetch()
    }

    console.log("AMM: ", ammPool?.data)


    return (
        <>
            <div className="flex flex-col gap-2 font-bold p-3 bg-[#383838]  rounded-xl my-3 w-full">
                                    
                <p> {collateralSymbol} </p>

                <p>Balance: {weiToCurrency(balance)} {collateralSymbol}</p>

                <div className="flex justify-center">

                    <button 
                        onClick={() => setDeposit(true)}
                        className="bg-blue-700 px-3 w-40  py-1">
                        Deposit
                    </button>

                    <button 
                        className="bg-green-700 px-3 w-40  py-1">
                        Withdraw
                    </button>

                </div>

            </div>


            <div className="flex flex-col gap-2 font-bold p-3 bg-[#383838]  rounded-xl my-3 w-full">
                                    
                <p> AMM Token </p>

                <p>Balance: {weiToCurrency(ammBalance)} </p>

            </div>


            <div className="flex justify-center">

                <button 
                    onClick={() => setBorrow(true)}
                    className="bg-blue-700 px-3 w-36 py-2 rounded-lg">
                    Borrow
                </button>

            </div>

            <ModalWrapper open={deposit} close={handleClose}>

                <LendingModal type="deposit" symbol={""} collateral={collateralToken} token={tokenToBorrow as Address} close={handleClose} />

            </ModalWrapper>


            <ModalWrapper open={borrow} close={handleClose}>

                <LendingModal type="borrow" symbol="" collateral={collateralToken} token={tokenToBorrow as Address} close={handleClose} />

            </ModalWrapper>


            <ModalWrapper open={withdraw} close={handleClose}>

                <LendingModal type="withdraw" symbol="" collateral={collateralToken} token={tokenToBorrow as Address} close={handleClose} />

            </ModalWrapper>

            

        </>
    )
}


export default CollateralCard