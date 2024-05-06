import { useAccount, useReadContract } from "wagmi"
import CollateralAbi from "@/abi/contracts/LCollateralPool.sol/LCollateralPool.json"
import useCurrentChain from "@/hooks/useCurrentChain"
import FactoryAbi from "@/abi/contracts/LFactory.sol/LFactory.json"
import { Address } from "viem"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import ModalWrapper from "./ModalWrapper"
import DepositCollateralModal from "./DepositCollateralModal"
import { weiToCurrency } from "@/lib/utils"
import { FACTORY } from "@/lib/constants"


const CollateralCard = ({ symbol, token } : { symbol: string, token: Address }) => {

    const { address } = useAccount() 
    const chain = useCurrentChain()

    const [deposit, setDeposit] = useState(false)
    const [withdraw, setWithdraw] = useState(false)

    const [collateral, setCollateral] = useState<Address | undefined>()

    const collateralPool = useReadContract({
        abi: FactoryAbi,
        address: FACTORY,
        functionName: "getCollateralPool",
        args: [token],
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

    useEffect(() => {
        if (collateralPool.isSuccess) {
            setCollateral(collateralPool.data as Address)
        }

        if (collateralPool.isError) {
            setCollateral(undefined)
            toast.error(collateralPool.error.shortMessage)
        }
        

    }, [collateralPool.isSuccess, collateralPool.data, collateralPool.isError, collateralPool.error])

    console.log({collateralPool})

    console.log({balanceOf})

    console.log({collateral})

    console.log({balance})

    const handleClose = () => {
        setDeposit(false)
        setWithdraw(false)
        balanceOf.refetch()
    }


    return (
        <>
            <div className="flex flex-col gap-2 font-bold p-3 bg-[#383838]  rounded-lg my-3 w-full">
                                    
                <p> {symbol} </p>

                <p>Balance: {weiToCurrency(balance)} {symbol}</p>

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

            <ModalWrapper open={deposit} close={handleClose}>

                <DepositCollateralModal symbol="" token={token as Address} close={handleClose} />

            </ModalWrapper>


            <ModalWrapper open={withdraw} close={handleClose}>

                <DepositCollateralModal symbol="" token={token as Address} close={handleClose} />

            </ModalWrapper>

        </>
    )
}


export default CollateralCard