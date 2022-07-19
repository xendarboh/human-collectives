module.exports = {
  mocha: {
    // only run tests with [solidity] in their description
    // Note: 2022-07-23 `hardhat coverage --testfiles 'test/contracts/**`
    // should work for a better solution but has strange assertion errors
    fgrep: "[solidity]",
  },
};
