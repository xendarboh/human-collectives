module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "corporate", "business"],
    // prevent comments from entering prettier output
    // https://github.com/saadeghi/daisyui/issues/811
    logs: false,
  },
};
