module.exports = {
  plugins: [
    require("prettier-plugin-solidity"),
    require("prettier-plugin-tailwindcss"),
  ],
  tabWidth: 2,
  bracketSpacing: true,

  // https://github.com/prettier-solidity/prettier-plugin-solidity#configuration-file
  overrides: [
    {
      files: "*.sol",
      options: {
        tabWidth: 4,
        explicitTypes: "always",
      },
    },
  ],
};
