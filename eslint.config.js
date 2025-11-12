// eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // ✅ GestureHandler 중복 import 경고 비활성화
      'import/no-duplicates': 'off',
    },
  },
]);
