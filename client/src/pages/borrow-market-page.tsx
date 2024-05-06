import CollateralCard from "@/components/CollateralCard"
import { useParams } from "react-router-dom"
import { Address } from "viem"

const BorrowMarketPage = () => {


    const { collateral, token } = useParams()

    console.log({token})


    return (
        <div className="h-full w-full px-10 pt-20">

            <div className="flex justify-center w-full">

                <div className="border-white bg-black border-2 w-[500px] h-[400px] p-4 rounded-xl">

                    <h2>Collaterals</h2>

                    <CollateralCard symbol={"debtInfo.collateral.symbol"} token={collateral as Address}/>



                </div>
            </div>


        </div>
    )
}

export default BorrowMarketPage