import SelectToken from "./SelectToken"

const SwapInput = () => {
    return (
        <div className="border-[1px] h-24 my-2 rounded-xl flex justify-between p-2">

            <div>
                <h4 className="text-xs">You Pay</h4>
                <input 
                    className="mt-2 text-3xl w-[300px] font-bold text-white outline-none border-none bg-inherit" 
                    type="number" placeholder="0" />
            </div>

            <div className="flex flex-col justify-end ">

                <SelectToken />

                <p className="text-right">price</p>

            </div>

        </div>
    )
}

export default SwapInput