import { useParams } from "react-router-dom"


const LoanPage = () => {

    const { collateral } = useParams()

    console.log(collateral)

    return (
        <div className="h-full w-full px-10 pt-20">

            <div className="flex justify-center w-full">

                <div className="border-white bg-black border-2 w-4/5 h-[400px] p-4 rounded-xl">

                    <h2>Loans</h2>


                </div>

            </div>

        </div>
    )
}

export default LoanPage