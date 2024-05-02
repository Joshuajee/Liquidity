import SwapInput from "@/components/SwapInput"
import Web3Btn from "@/components/Web3Btn"

const SwapPage = () => {
    return (
        <div className="flex justify-center items-center h-full w-full">

            <div className="w-[500px] border-[1px] mt-20 border-white rounded-3xl p-4">
                <h2>Swap</h2>

                <SwapInput />

                <SwapInput />

                <Web3Btn>Swap</Web3Btn>

            </div>

        </div>
    )
}

export default SwapPage