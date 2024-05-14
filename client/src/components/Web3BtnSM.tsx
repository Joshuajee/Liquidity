import { ReactNode } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

interface IProps {
    children: ReactNode;
    loading?: boolean;
    onClick: () => void;
}

const Web3BtnSM = ({ children, loading, onClick } : IProps) => {
    
    const { isConnected } = useAccount()

    const handleClick = () => {

        if (!isConnected) return toast.error("Please connect wallet")

        onClick()
        
    }

    if (loading) return (
        <button className="rounded-xl py-2 px-4 w-full bg-gray-700">
            Loading...
        </button>
    )

    return (
        <button onClick={handleClick} className="rounded-xl py-2 px-4 w-full bg-green-700">
            { children }
        </button>
    )
}

export default Web3BtnSM