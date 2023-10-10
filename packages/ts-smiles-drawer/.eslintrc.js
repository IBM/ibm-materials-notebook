module.exports = {
  root: true,
  extends: ["@ibm-materials/eslint-config"],
  rules: {
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/semi": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
  },
  ignorePatterns: ["out", "dist", "**/*.d.ts"],
};
