import AmmPoolCard from "@/components/AmmPoolCard"
import useAmmPools from "@/hooks/useAmmPools"

const BorrowPage = () => {

    const ammPools = useAmmPools() as any[]

    return (
        <div className="h-full w-full px-10 pt-20">

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