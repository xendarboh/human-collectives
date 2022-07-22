import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
