import { useState } from "react"
import ModalWrapper from "./modals/ModalWrapper"
import { DEFAULT_TOKENS } from "@/lib/constants"
import { IToken } from "@/lib/interfaces"


interface IProps {
    selected?: IToken;
    setSelected: (selected: IToken) => void;
}

const SelectToken = ({ selected, setSelected } : IProps) => {

    const [open, setOpen] = useState(false)

    return (
        <>
            <button onClick={() => setOpen(true)} className="bg-gray-300 rounded-full px-4 py-1 text-black">
                { selected ?  selected.symbol : "Select Token" }
            </button>

            <ModalWrapper 
                open={open} 
                close={() => setOpen(false)}>

                    <div className="rounded-xl h-[400px] w-[400px] bg-black border-[1px] border-white p-3">

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

                        <div className="flex flex-col gap-3 mt-4 overflow-y-auto h-[380px]">

                            {
                                DEFAULT_TOKENS.map((token, index) => {
                                    return (
                                        <div onClick={() => {setSelected?.(token); setOpen(false) } } key={index} className="flex py-2 rounded-md cursor-pointer px-6 gap-x-5 hover:bg-gray-900">

                                            <div className="flex justify-center items-center">
                                                <img className="rounded-full" width={"40px"} height={"40px"} src={token.icon} alt="Coin" />
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