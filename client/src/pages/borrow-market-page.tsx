import CollateralCard from "@/components/CollateralCard"
import { useParams } from "react-router-dom"
import { Address } from "viem"

const BorrowMarketPage = () => {

    const { collateral, token } = useParams()

    return (
        <div className="h-full w-full px-10 pt-20">

            <div className="flex justify-center w-full">

                <div className="border-white bg-black border-2 w-4/5  p-4 rounded-xl">

                    <h2>Collaterals</h2>

                    <CollateralCard collateralToken={collateral as Address} tokenToBorrow={token as Address} />


                </div>

            </div>

        </div>
    )
}

export default BorrowMarketPage