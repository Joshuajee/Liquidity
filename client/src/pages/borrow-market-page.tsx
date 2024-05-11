import CollateralCard from "@/components/CollateralCard"
import { useParams } from "react-router-dom"
import { Address } from "viem"

const BorrowMarketPage = () => {

    const { collateral, token } = useParams()

    return (
        <div className="h-full w-full px-10 pt-20">

            <div className="flex justify-center w-full">

                <div className="border-white bg-black border-2 w-11/12  p-4 rounded-xl">

                    <h2 className="text-center text-3xl font-bold">Collaterals</h2>

                    <div className="flex gap-4 justify-center">

                        <CollateralCard isAmmToken={false} collateralToken={collateral as Address} tokenToBorrow={token as Address} />

                        <CollateralCard isAmmToken={true} collateralToken={collateral as Address} tokenToBorrow={token as Address} />

                    </div>

                </div>

            </div>

        </div>
    )
}

export default BorrowMarketPage