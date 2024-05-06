import { getPair } from "@/lib/utils";
import { Address } from "viem"
import { useNavigate } from "react-router-dom";

export interface IAmmPool {
    token0: Address;
    token1: Address;
    reserve0: bigint;
    reserve1: bigint;
}

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

    const navigate = useNavigate()

    const { symbol1, symbol2 } = getPair(pool.token0, pool.token1)


    const BorrowBtn = ({symbol}: {symbol: string}) => {

        const borrow = () => {
            if (symbol === symbol1) {
                navigate("/borrow/"+pool.token1+"/"+pool.token0)
            } else {
                navigate("/borrow/"+pool.token0+"/"+pool.token1)
            }
        }

        return (
            <button 
                onClick={borrow} 
                className="bg-blue-700 px-3 w-40  py-1">
                Borrow {symbol}
            </button>
        )
    }



    return (
        <>  

            <div className="flex gap-2 items-center font-bold px-3 bg-[#383838] h-14 rounded-lg my-3 w-full">
                                    
                <p> 
                    {symbol1} / {symbol2}
                </p>

                <p>1 {symbol1} = {(pool.reserve0 / pool.reserve1).toString()} {symbol2}</p>

                <p className="grow"></p>

                <BorrowBtn symbol={symbol1} />

                <BorrowBtn symbol={symbol2} />

            </div>

        </>
    )
}

export default AmmPoolCard