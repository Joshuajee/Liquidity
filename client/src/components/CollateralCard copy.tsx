
const CollateralCard = () => {

    // const { address } = useAccount() 
    // const chain = useCurrentChain()


    // const balanceOfAmm = useReadContract({
    //     abi: LSwapPairAbi,
    //     functionName: "balanceOf",
    //     address: ammPool.data as Address,
    //     args: [address],
    //     account: address,
    //     chainId: chain?.id
    // })

    // const balance = (balanceOf as any).data || 0n

    // const ammBalance = (balanceOfAmm as any).data || 0n

    // const handleClose = () => {
    //     setDeposit(false)
    //     setWithdraw(false)
    //     setBorrow(false)
    //     balanceOf.refetch()
    // }

    // console.log("AMM: ", ammPool?.data)


    return (
        <>


            {/* <div className="flex flex-col gap-2 font-bold p-3 bg-[#383838]  rounded-xl my-3 w-full">
                                    
                <p> AMM Token </p>

                <p>Balance: {weiToCurrency(ammBalance)} </p>

            </div>


            <div className="flex justify-center">

                <button 
                    onClick={() => setBorrow(true)}
                    className="bg-blue-700 px-3 w-36 py-2 rounded-lg">
                    Borrow
                </button>

            </div> */}

            

        </>
    )
}


export default CollateralCard