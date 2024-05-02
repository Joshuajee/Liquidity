import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import 'solidity-coverage'
import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = String(process.env.PRIVATE_KEY);

const LISK_RPC = String(process.env.LISK_RPC);

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: false,
            runs: 200,
          },
        },
      },
    ]
  },
  networks: {
    liskSepolia: {
      url: LISK_RPC,
      accounts: [PRIVATE_KEY],
    },
  },
  abiExporter: [
    {
      path: "../client/src/abi",
      pretty: false,
      runOnCompile: true,
      only: ["LFactory", "LSwapPair", "LCollateralPool", "MockERC20", "LRouter"],
    },
  ],
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["LFactory", "LSwapPair", "LCollateralPool", "LRouter"],
  },
};

export default config;
