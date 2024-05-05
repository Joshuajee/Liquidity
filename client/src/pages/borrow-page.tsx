import AmmPoolCard from "@/components/AmmPoolCard"
import useAmmPools from "@/hooks/useAmmPools"

const BorrowPage = () => {


    const ammPools = useAmmPools() as any[]


    console.log({ammPools})


    return (
        <div className="grid grid-cols-2 gap-5 h-full w-full px-10 pt-20">

            <div className="w-full">

                <h3 className="font-bold text-3xl">Amm Pools</h3>

                {
                    ammPools?.map((ammPool, index) => {
                        return <AmmPoolCard pool={ammPool} key={index}/>
                    })
                }

            </div>

            <div className="w-full">

                <h3 className="font-bold text-3xl">Amm Pools</h3>

                {
                    ammPools?.map((ammPool, index) => {
                        return <AmmPoolCard pool={ammPool} key={index}/>
                    })
                }

            </div>


        </div>
    )
}

export default BorrowPage