import { IToken } from "@/lib/interfaces";
import SelectToken from "./SelectToken"
import { useAccount, useReadContract } from "wagmi";
import TokenAbi from "@/abi/contracts/mocks/MockERC20.sol/MockERC20.json"
import { ChangeEvent, useEffect } from "react";
import { weiToCurrency } from "@/lib/utils";
import useCurrentChain from "@/hooks/useCurrentChain";

interface IProps {
    value: string;
    setValue: (value: string) => void;
    selected?: IToken;
    setSelected: (selected: IToken) => void;
}


const SwapInput = ({ value, selected, setValue, setSelected} : IProps) => {

    const { address } = useAccount()

    const chain = useCurrentChain()

    const { data, isError, error, refetch } = useReadContract({
        abi: TokenAbi,
        address: selected?.address,
        functionName: "balanceOf",
        args: [address],
        chainId: chain.id
    })

    useEffect(() => {
        refetch()
    }, [selected?.address])

    useEffect(() => {
        if (isError) console.log(error)
    }, [isError, error])

    return (
        <div className="border-[1px] h-24 my-2 rounded-xl flex justify-between p-2">

            <div>
                <h4 className="text-xs">You Pay</h4>
                <input 
                    value={value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
                    className="mt-2 text-3xl w-[300px] font-bold text-white outline-none border-none bg-inherit" 
                    type="number" placeholder="0" />
            </div>

            <div className="flex flex-col justify-end ">

                <SelectToken selected={selected} setSelected={setSelected} />

                <p className="text-right h-5">
                    { data ? "Balance: " +  weiToCurrency(BigInt(data as number)) : ""}
                </p>
            
            </div>

        </div>
    )
}

export default SwapInput