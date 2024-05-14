import { getPair, weiToCurrency } from "@/lib/utils";
import { Address } from "viem"
import Web3BtnSM from "./Web3BtnSM";
import { IAmmPool } from "@/hooks/useAmmPools";
import { useState } from "react";
import useViemClient from "@/hooks/useViemClient";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import LSwapAbi from "@/abi/contracts/LSwapPair.sol/LSwapPair.json"
import ModalWrapper from "./modals/ModalWrapper";
import RemoveLiquidityModal from "./modals/RemoveLiquidityModal";

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
    const [open, setOpen] = useState(false)

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

    const ratio = pool.reserve1 * 10000n / pool.reserve0


    return (
        <>  

            <div className="font-bold p-3 bg-[#383838] h-20 rounded-xl my-3 w-full">

                <div className="flex">

                    <p> 
                        {symbol1} / {symbol2}
                    </p>

                    <p className="ml-2"> 1 {symbol1} = {(Number(ratio) / 10000).toFixed(4)} {symbol2}</p>

                    <p className="flex grow"> </p>

                    <div className="flex gap-2 justify-center">
                        
                        <button 
                            onClick={() => setOpen(true)}
                            className="bg-blue-700 px-3 w-40 py-2 rounded-xl">
                            Remove Liquidity
                        </button>

                        <div>
                            <Web3BtnSM loading={loading} onClick={collectFees}> Collect Fees </Web3BtnSM>
                        </div>

                    </div>

                </div>

                <p className="flex grow">
                    <p>Fees - {weiToCurrency(pool.fee0)} {symbol1} , {weiToCurrency(pool.fee1)} {symbol2}</p>
                </p>

            </div>

            <ModalWrapper open={open} close={() => setOpen(false)}>
                <RemoveLiquidityModal pool={pool.pool} close={() => setOpen(false)} />
            </ModalWrapper>

        </>
    )
}

export default AmmPoolCard