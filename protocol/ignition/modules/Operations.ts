import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import LFactoryModule, { DAIModule, LSwapPairModule, USDCModule, USDTModule, WBTCModule } from "./Liquidity";
import { maxUint256, parseEther } from "viem";

const deposit0 = parseEther("20000000", "wei")
const deposit1 = parseEther("20000000", "wei")

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



export const USDCAndWBTCPairModule = buildModule("USDCAndWBTCPairModule", (m) => {

  const { TUSDC } = m.useModule(USDCModule)
  const { TWBTC } = m.useModule(WBTCModule)

  const { LRouter } = m.useModule(LFactoryModule)

  const input : any = [ TUSDC, TWBTC, deposit0, deposit1 / 630000n, 0n, 0n,  account, "100000000000000000"]

  m.call(LRouter, "addLiquidity", [input])

  return { TUSDC, TWBTC };

});


export const USDTAndDAIPairModule = buildModule("USDTAndDAIPairModule", (m) => {

  const { TUSDT } = m.useModule(USDTModule)
  const { TDAI } = m.useModule(DAIModule)

  const { LRouter } = m.useModule(LFactoryModule)

  const input : any = [ TUSDT, TDAI, deposit0, deposit1, 0n, 0n,  account, "100000000000000000"]

  m.call(LRouter, "addLiquidity", [input])

  return { TUSDT, TDAI };

});


export const USDTAndWBTCPairModule = buildModule("USDTAndWBTCPairModule", (m) => {

  const { TUSDT } = m.useModule(USDTModule)
  const { TWBTC } = m.useModule(WBTCModule)

  const { LRouter } = m.useModule(LFactoryModule)

  const input : any = [ TUSDT, TWBTC, deposit0, deposit1 / 63000n, 0n, 0n,  account, "100000000000000000"]

  m.call(LRouter, "addLiquidity", [input])

  return { TUSDT, TWBTC };

});


export const DAIAndWBTCPairModule = buildModule("DAIAndWBTCPairModule", (m) => {

  const { TDAI } = m.useModule(DAIModule)
  const { TWBTC } = m.useModule(WBTCModule)

  const { LRouter } = m.useModule(LFactoryModule)

  const input : any = [ TDAI, TWBTC, deposit0, deposit1 / 63000n, 0n, 0n,  account, "100000000000000000"]

  m.call(LRouter, "addLiquidity", [input])

  return { TDAI, TWBTC };

});

const OperationsModule = buildModule("OperationsModule", (m) => {

  m.useModule(ApprovalModule)

  m.useModule(USDCAndUSDTPairModule)
  m.useModule(USDCAndDAIPairModule)
  m.useModule(USDCAndWBTCPairModule)
  m.useModule(USDTAndDAIPairModule)
  m.useModule(USDTAndWBTCPairModule)
  m.useModule(DAIAndWBTCPairModule)

  const { LFactory, LRouter } = m.useModule(LFactoryModule)

  //send funds
  

  return { LFactory, LRouter };

});



export default OperationsModule
