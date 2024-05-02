import AddLiquidity from "@/components/AddLiquidity"

const AddLiquidityPage = () => {


    return (
        <div className="flex justify-center h-full w-full px-10">

            <div className="w-[800px]">

                <div className="flex justify-center mt-10 mb-4 w-full">

                    <AddLiquidity />
     
                </div>

                <div className="w-full border-[1px] mt-2 border-white rounded-3xl p-4">

                    <p className="text-center"> No Liquidity Found </p>

                </div>

            </div>

        </div>
    )
}

export default AddLiquidityPage