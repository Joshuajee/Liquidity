import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenModule = buildModule("TokenModule", (m) => {

  const TUSDC = m.contract("MockERC20", ["Test USDC", "TUSDC"])
  // const TUSDT = m.contract("MockERC20", ["Test USDT", "TUSDT"])
  // const TDAI  = m.contract("MockERC20", ["Test DAI", "TDAI"])
  // const TWBTC = m.contract("MockERC20", ["Test WBTC", "TBTC"])

  return { TUSDC,  };
});

export default TokenModule;
