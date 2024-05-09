import { getPair, weiToCurrency } from "@/lib/utils";
import { Address } from "viem"
import Web3BtnSM from "./Web3BtnSM";
import { IAmmPool } from "@/hooks/useAmmPools";


interface IProps {
    pool: IAmmPool
}


interface IBorrow {
    token: Address;
    symbol: string
}

export interface IDebtInfo {
    collateral: IBorrow;
    debt: IBorrow;
}

const AmmPoolCard = ({ pool } : IProps) => {


    const { symbol1, symbol2 } = getPair(pool.token0, pool.token1)


    return (
        <>  

            <div className="flex gap-2 items-center font-bold px-3 bg-[#383838] h-14 rounded-xl my-3 w-full">
                                    
                <p> 
                    {symbol1} / {symbol2}
                </p>

                <p> 1 {symbol1} = {(Number(pool.reserve0 * 1000n / pool.reserve1)/1000).toString()} {symbol2}</p>

                <p className="flex justify-end grow">
                    <p>Fees - {weiToCurrency(pool.fee0)} {symbol1} , {weiToCurrency(pool.fee1)} {symbol2}</p>
                </p>

                <div className="">
                    <Web3BtnSM onClick={() => alert("FEES")}>
                        Collect Fees
                    </Web3BtnSM>
                </div>

            </div>

        </>
    )
}

export default AmmPoolCard