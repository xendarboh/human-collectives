/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node"],
  plugins: ["chai-friendly", "prettier"],
  rules: {
    "@typescript-eslint/no-unused-expressions": "off",
    "chai-friendly/no-unused-expressions": 2,
    "prettier/prettier": "error",
  },
};
