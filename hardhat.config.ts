import type { HardhatUserConfig } from "hardhat/config";

// hardhat-toolbox includes several other hardhat plugins
// https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-toolbox
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
