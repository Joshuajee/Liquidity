import { useState } from "react"
import ModalWrapper from "./ModalWrapper"
import { DEFAULT_TOKENS } from "@/lib/constants"

const SelectToken = () => {

    const [open, setOpen] = useState(false)

    return (
        <>
            <button onClick={() => setOpen(true)} className="bg-gray-300 rounded-full px-4 py-1 text-black">
                Select Token
            </button>

            <ModalWrapper 
                open={open} 
                close={() => setOpen(false)}>

                    <div className="rounded-xl h-80 w-[400px] bg-black border-[1px] border-white p-3">

                        <div className="flex justify-between">
                            <h4>Select a Token</h4>

                            <button onClick={() => setOpen(false)}>X</button>
                        </div>

                        <div>

                            <input
                                className="bg-inherit indent-10 w-full h-9 my-3 border-[1px] border-white" 
                                type="text" placeholder="paste address" />

                        </div>

                        <hr></hr>

                        <div className="flex flex-col gap-3 mt-4">

                            {
                                DEFAULT_TOKENS.map((token, index) => {
                                    return (
                                        <div key={index} className="flex gap-x-5">

                                            <div>
                                                <img className="rounded-full" width={"50px"} height={"50px"} src={token.icon} alt="Coin" />
                                            </div>

                                            <div>
                                                <p>{token.name}</p>
                                                <p className="text-xs">{token.symbol}</p>
                                            </div>

                                        </div>
                                    )
                                })
                            }

                        </div>


                    </div>

            </ModalWrapper>

        </>
    )

}

export default SelectToken