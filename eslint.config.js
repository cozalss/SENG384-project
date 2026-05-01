import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Uppercase + `motion` (framer-motion is always used via JSX member
      // expressions like <motion.div />, which base no-unused-vars cannot track
      // without eslint-plugin-react's react/jsx-uses-vars). The same applies
      // to destructured parameter renames like `({ icon: Icon })` where Icon
      // is consumed solely as a JSX tag — flag args under the same pattern.
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^(motion|[A-Z_])',
        argsIgnorePattern: '^(motion|[A-Z_])',
      }],
    },
  },
])
