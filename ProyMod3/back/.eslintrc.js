module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    // Agregar acá las reglas personalizadas que desee
    "no-var": "error",
    "prefer-const": "error",
  },
};
