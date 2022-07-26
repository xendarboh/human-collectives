/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  // root: true,
  // parser: "@typescript-eslint/parser",
  // parserOptions: {
  //   tsconfigRootDir: __dirname,
  //   project: ["./tsconfig.json"],
  // },
  env: {
    mocha: true,
  },
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "eslint:recommended",
    // "plugin:@typescript-eslint/recommended",
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  plugins: ["@typescript-eslint", "chai-friendly", "prettier"],
  rules: {
    "@typescript-eslint/no-unused-expressions": "off",
    "chai-friendly/no-unused-expressions": 2,
    "prettier/prettier": "error",
  },
};
