import SwapInput from "@/components/SwapInput"
import Web3Btn from "./Web3Btn"

const AddLiquidity = () => {
    return (
        <div className="flex justify-center items-center h-full w-full">

            <div className="w-[500px] border-[1px] mt-20 border-white rounded-3xl p-4">
                <h2>Add Liquidity</h2>

                <SwapInput />

                <SwapInput />

                <Web3Btn> Add Liquidity</Web3Btn>

            </div>

        </div>
    )
}

export default AddLiquidity