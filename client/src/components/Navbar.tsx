import { ConnectKitButton } from "connectkit"
import { Link } from "react-router-dom"

const Navbar = () => {

    return (
        <div className="flex items-center justify-between h-16 bg-[#131313] border-b-[1px] px-10 mx-2">

            <Link className="text-2xl font-bold" to={"/"}>Liqudity</Link>

            <div className="flex gap-3 text-sm">

                <Link to={"/"}>Swap</Link>

                <Link to={"/add"}>Add Liquidity</Link>

                <Link to={"/borrow"}>Borrow</Link>

            </div>

            <div>
                <ConnectKitButton />
            </div>

        </div>
    )
}

export default Navbar