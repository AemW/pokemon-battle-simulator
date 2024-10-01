module.exports = {
  root: true,
  extends: [
    'eslint-config-airbnb',
    'eslint-config-airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  plugins: ['eslint-comments'],
  env: {
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    requireConfigFile: false,
    project: ['./tsconfig.eslint.json', './backend/tsconfig.json', './pokemon-team-builder/tsconfig.json'],
  },
  rules: {
    // Ensures no eslint-disables are used unnecessarily:
    'eslint-comments/no-unused-disable': ['error'],
    // Opinionated changes from the presets:
    'operator-linebreak': 'off',
    semi: ['error', 'never'],
    'no-use-before-define': ['off'],
    '@typescript-eslint/no-use-before-define': ['off'],
    'linebreak-style': ['off'], // linebreak style is  handled by git, we should not have to care about it
    'import/prefer-default-export': ['off'], //
    'function-paren-newline': ['off'],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          consistent: true,
          multiline: true,
        },
        ObjectPattern: {
          consistent: true,
          multiline: true,
        },
      },
    ],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'enum',
        format: ['UPPER_CASE'],
      },
    ],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
}
