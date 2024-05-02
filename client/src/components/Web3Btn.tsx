import { ReactNode } from "react";
import { useAccount } from "wagmi";

interface IProps {
    children: ReactNode;
}

const Web3Btn = ({ children } : IProps) => {
    
    const { isConnected } = useAccount()

    const handleClick = () => {

    }

    return (
        <button onClick={handleClick} className="rounded-xl py-2 px-4 w-full bg-green-700 h-14">
            { isConnected ? children : "Please Connect Wallet"}
        </button>
        )
}

export default Web3Btn