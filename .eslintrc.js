module.exports = {
    "extends": "standard",
    "rules": {
      "comma-dangle": ["error", "always-multiline"],
      "semi": ["error", "always"],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "padded-blocks": "off",
      "no-multiple-empty-lines": "off"
    },
    "parser": "babel-eslint",
    "parserOptions": {
      "ecmaVersion": 6,
      "sourceType": "module",
      "ecmaFeatures": {
        "generators": true
      }
    },
    "globals": {
      "fetch": true
    },
    "env": {
      "jasmine": true,
      "jest": true
    }
};
