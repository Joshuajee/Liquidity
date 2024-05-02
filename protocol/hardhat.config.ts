import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import 'solidity-coverage'
import dotenv from "dotenv";

dotenv.config();

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
  abiExporter: [
    {
      path: "../client/src/abi",
      pretty: false,
      runOnCompile: true,
      only: ["LFactory", "LSwapPair", "LCollateralPool"],
    },
  ],
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["LFactory", "LSwapPair", "LCollateralPool"],
  },
};

export default config;
