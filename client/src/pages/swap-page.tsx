import SwapInput from "@/components/SwapInput"

const SwapPage = () => {
    return (
        <div className="flex justify-center items-center h-full w-full">

            <div className="w-[500px] border-[1px] mt-20 border-white rounded-3xl p-4">
                <h2>Swap</h2>

                <SwapInput />

                <SwapInput />

                <button
                    className="rounded-xl py-2 px-4 w-full bg-green-700 h-14"
                    >

                    Swap
                </button>

            </div>

        </div>
    )
}

export default SwapPage