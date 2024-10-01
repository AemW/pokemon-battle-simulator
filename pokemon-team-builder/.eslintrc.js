module.exports = {
  env: {
    browser: true,
  },
  rules: {
    // Rules from our preset that we disable:
    'react/function-component-definition': ['off'],
    'react/button-has-type': ['off'],
    'react/one-expression-per-line': ['off'], // Turning this off, since it does not work with eslint indent for one liners.
    'react/jsx-one-expression-per-line': ['off'],
    'react/jsx-props-no-spreading': ['off'], // Prevents ...props
    'react/jsx-indent': [2, 2],
  },
}
