import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export const USDCModule = buildModule("USDCModule", (m) => {

  const TUSDC = m.contract("MockERC20", ["Test USDC", "TUSDC"])

  return { TUSDC };
});


export const USDTModule = buildModule("USDTModule", (m) => {

  const TUSDT = m.contract("MockERC20", ["Test USDT", "TUSDT"])

  return { TUSDT };
});

export const DAIModule = buildModule("DAIModule", (m) => {

  const TDAI = m.contract("MockERC20", ["Test DAI", "TDAI"])

  return { TDAI };
});


export const WBTCModule = buildModule("TWBTCModule", (m) => {

  const TWBTC = m.contract("MockERC20", ["Test WBTC", "TWBTC"])

  return { TWBTC };
});


export const LSwapPairModule = buildModule("LSwapPairModule", (m) => {

  const LSwapPair = m.contract("LSwapPair");

  return { LSwapPair };

});


const LFactoryModule = buildModule("LFactoryModule", (m) => {

  m.useModule(USDCModule)
  m.useModule(USDTModule)
  m.useModule(DAIModule)
  m.useModule(WBTCModule)

  const { LSwapPair } = m.useModule(LSwapPairModule);

  const LFactory = m.contract("LFactory", [LSwapPair]);

  const LRouter = m.contract("LRouter", [LFactory, LFactory]);

  return { LFactory, LRouter };

});



export default LFactoryModule
