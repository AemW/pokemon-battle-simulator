module.exports = {
  env: {
    browser: true,
  },
  rules: {
    // TODO Rules that we need to change and refactor affected code:
    'react/no-multi-comp': ['off'], // Having helper components in the same class is useful and prevents having too many files
    'react/no-array-index-key': ['off'], // When a list does not have unique values and cannot be reordered, using index is ok
    // Remove these when converting to Typescript:
    'react/forbid-prop-types': ['off'], // Currently we are passing around lots of objects in the code. Some day we can drop this rule, but we are not there yet
    'react/prop-types': ['off'],
    'react/require-default-props': ['off'], // Default props for callbacks gives bloaty code. The fuss from booleans sometimes being null is smaller
    // Rules from our preset that we disable:
    'react/function-component-definition': ['off'],
    'react/button-has-type': ['off'],
    'react/one-expression-per-line': ['off'], // Turning this off, since it does not work with eslint indent for one liners.
    'react/jsx-one-expression-per-line': ['off'],
    'react/jsx-props-no-spreading': ['off'], // Prevents ...props
    'jsx-a11y/no-autofocus': ['off'], // Our users want autofocus
    'react/jsx-indent': [2, 2],
  },
}
