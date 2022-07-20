import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
