import Web3BtnSM from "@/components/Web3BtnSM"
import useViemClient from "@/hooks/useViemClient"
import { DEFAULT_TOKENS } from "@/lib/constants"
import { IToken } from "@/lib/interfaces"
import { useState } from "react"
import { toast } from "react-toastify"
import { parseEther } from "viem"
import { useAccount } from "wagmi"
import TokenAbi from "@/abi/contracts/mocks/MockERC20.sol/MockERC20.json"



const FaucetPage = () => {


    const Token = ({ token } : {token: IToken }) => {

        const { address } = useAccount()

        const { publicClient, walletClient } = useViemClient()

        const [loading, setLoading] = useState(false)

        const claim = async () => {
            setLoading(true)
            try {
                const { request } = await publicClient.simulateContract({
                    address: token.address,
                    abi: TokenAbi,
                    functionName: 'mint',
                    args: [address, parseEther("1000", "wei")],
                    account: address
                })
                await walletClient.writeContract(request)
                toast.success("You minted 1000 " + token.symbol)
            } catch (e) {
                toast.error((e as any)?.shortMessage)
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        return (
            <div className="flex py-2 w-80  rounded-md cursor-pointer px-6 gap-x-5 hover:bg-gray-900">

                <div className="flex justify-center items-center">
                    <img className="rounded-full" width={"40px"} height={"40px"} src={token.icon} alt="Coin" />
                </div>

                <div>
                    <p>{token.name}</p>
                    <p className="text-xs">{token.symbol}</p>
                </div>

                <div className="grow">
                    <Web3BtnSM loading={loading} onClick={claim}>
                        Claim
                    </Web3BtnSM>
                </div>

            </div>
        )
    }
    return (
        <div className="h-full w-full px-10 pt-20">

            <div className="flex justify-center w-full">

                <div className="border-white bg-black border-2 w-4/5 p-4 rounded-xl">

                    <h2 className="text-center font-bold text-2xl">Get Test Tokens</h2>


                    <div className="flex gap-4 justify-center flex-wrap">

                        {
                            DEFAULT_TOKENS.map((token, index) => {
                                return (<Token token={token} key={index} /> )
                            })
                        }

                    </div>

                </div>

            </div>

        </div>
    )
}

export default FaucetPage