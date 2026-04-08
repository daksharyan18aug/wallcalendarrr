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
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'indent': ['error', 2, { SwitchCase: 1, VariableDeclarator: { var: 2, let: 2, const: 3 }, outerIIFEBody: 0, MemberExpression: 1, FunctionDeclaration: { parameters: 2, body: 2 }, FunctionExpression: { parameters: 2, body: 2 }, CallExpression: { arguments: 2 }, ArrayExpression: 1, ObjectExpression: 1, ImportDeclaration: 1, flatTernaryExpressions: true, ignoreComments: true, ignoredNodes: ['JSXElement *', 'JSXFragment *', 'JSXAttribute', 'JSXSpreadAttribute'], JSXChildren: 'tab' }],
    },
  },
])
