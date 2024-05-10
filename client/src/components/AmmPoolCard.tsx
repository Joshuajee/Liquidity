import { getPair, weiToCurrency } from "@/lib/utils";
import { Address } from "viem"
import Web3BtnSM from "./Web3BtnSM";
import { IAmmPool } from "@/hooks/useAmmPools";
import { useState } from "react";
import useViemClient from "@/hooks/useViemClient";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import LSwapAbi from "@/abi/contracts/LSwapPair.sol/LSwapPair.json"

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

    const { address } = useAccount()

    const [loading, setLoading] = useState(false)

    const { publicClient, walletClient } = useViemClient()


    const { symbol1, symbol2 } = getPair(pool.token0, pool.token1)

    const collectFees = async () => {
        setLoading(true)
        try {
            const { request } = await publicClient.simulateContract({
                address: pool.pool,
                abi: LSwapAbi,
                functionName: 'withdrawFees',
                args: [address],
                account: address
            })
            await walletClient.writeContract(request)
            toast.success("Fees Claimed")
            close()
        } catch (e) {
            toast.error((e as any)?.shortMessage)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }


    return (
        <>  

            <div className="font-bold p-3 bg-[#383838] h-20 rounded-xl my-3 w-full">

                <div className="flex">

                    <p> 
                        {symbol1} / {symbol2}
                    </p>

                    <p> 1 {symbol1} = {(Number(pool.reserve0 * 1000n / pool.reserve1)/1000).toString()} {symbol2}</p>

                    <p className="flex grow"> </p>

                    <div className="">
                        <Web3BtnSM loading={loading} onClick={collectFees}>
                            Collect Fees
                        </Web3BtnSM>
                    </div>

                </div>

                <p className="flex grow">
                    <p>Fees - {weiToCurrency(pool.fee0)} {symbol1} , {weiToCurrency(pool.fee1)} {symbol2}</p>
                </p>

            </div>

        </>
    )
}

export default AmmPoolCard