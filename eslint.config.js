// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const simpleImportSort = require("eslint-plugin-simple-import-sort");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [["^\\u0000"], ["^react$"], ["^@"], ["^[a-z]"], ["^~"], ["^\\./", "^\\.\\./"]],
        },
      ],
      "react/react-in-jsx-scope": "off",
      "no-empty-pattern": "off",
    },
  },
]);
