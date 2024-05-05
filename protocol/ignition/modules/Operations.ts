import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import LFactoryModule, { DAIModule, LSwapPairModule, USDCModule, USDTModule, WBTCModule } from "./Liquidity";
import { maxUint256, parseEther } from "viem";

const deposit0 = parseEther("1000", "wei")
const deposit1 = parseEther("1000", "wei")

const account = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

export const ApprovalModule = buildModule("ApprovalModule", (m) => {

  const { LRouter } = m.useModule(LFactoryModule)

  const { TUSDC } = m.useModule(USDCModule)
  const { TUSDT } = m.useModule(USDTModule)
  const { TDAI  } = m.useModule(DAIModule)
  const { TWBTC } = m.useModule(WBTCModule)

  m.call(TUSDC, "approve", [LRouter, maxUint256])
  m.call(TUSDT, "approve", [LRouter, maxUint256])
  m.call(TDAI, "approve", [LRouter, maxUint256])
  m.call(TWBTC, "approve", [LRouter, maxUint256])

  return {}

});

export const USDCAndUSDTPairModule = buildModule("USDCAndUSDTPairModule", (m) => {

  const { TUSDC } = m.useModule(USDCModule)
  const { TUSDT } = m.useModule(USDTModule)

  const { LRouter } = m.useModule(LFactoryModule)

  const input : any = [ TUSDC, TUSDT, deposit0, deposit1, 0n, 0n,  account, "100000000000000000"]

  m.call(LRouter, "addLiquidity", [input])

  return { TUSDC, TUSDT };

});


export const USDCAndDAIPairModule = buildModule("USDCAndDAIPairModule", (m) => {

  const { TUSDC } = m.useModule(USDCModule)
  const { TDAI } = m.useModule(DAIModule)

  const { LRouter } = m.useModule(LFactoryModule)

  const input : any = [ TUSDC, TDAI, deposit0, deposit1, 0n, 0n,  account, "100000000000000000"]

  m.call(LRouter, "addLiquidity", [input])

  return { TUSDC, TDAI };

});



const OperationsModule = buildModule("OperationsModule", (m) => {

  const { TUSDC } = m.useModule(USDCModule)
  const { TUSDT } = m.useModule(USDTModule)
  const { TDAI  } = m.useModule(DAIModule)
  const { TWBTC } = m.useModule(WBTCModule)

  m.useModule(ApprovalModule)
  m.useModule(USDCAndUSDTPairModule)
  m.useModule(USDCAndDAIPairModule)

  const { LFactory, LRouter } = m.useModule(LFactoryModule)

  // m.call(LFactory, "createPair", [TUSDC, TDAI])
  // m.call(LFactory, "createPair", [TUSDC, TWBTC])

  //m.call(TUSDC, "transfer", [LSwapPair, deposit0])

  // await MockERC20_1.write.transfer([LSwapPairPool.address, deposit1]) 

  // await LSwapPairPool.write.mint([account1.account.address])

  // const LFactory = m.contract("LFactory", [LSwapPair]);

  // const LRouter = m.contract("LRouter", [LFactory, LFactory]);

  return { LFactory, LRouter };

});



export default OperationsModule
