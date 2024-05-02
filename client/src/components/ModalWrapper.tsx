import { ReactNode } from "react"

interface IProps {
    children: ReactNode;
    open: boolean;
    close: () => void;
}

const ModalWrapper = ({ children, open }: IProps) => {

    if (!open) return (<></>)

    return (
        <div className="fixed flex justify-center items-center top-0 left-0 w-screen h-screen bg-gray-900/55">
            {children}
        </div>
    )
}

export default ModalWrapper