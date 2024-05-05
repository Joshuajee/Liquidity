import { getPair } from "@/lib/utils";
import { Address } from "viem"

export interface IAmmPool {
    token0: Address;
    token1: Address;
    reserve0: bigint;
    reserve1: bigint;
}

interface IProps {
    pool: IAmmPool
}

const AmmPoolCard = ({ pool } : IProps) => {



    return (
        <div className="flex gap-2 items-center font-bold px-3 bg-[#383838] h-14 rounded-lg my-3 w-full">
                                
            <p> 
                {getPair(pool.token0, pool.token1)}
            </p>

            <p> {(pool.reserve0 * pool.reserve1).toString()}</p>

        </div>
    )
}

export default AmmPoolCard