module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
    sourceType: 'module',  // Allows for the use of imports
  },
  env: {
    'node': true
  },
  // TODO: setting ext is currently not supported in config file. Can only be set using environment variables. Review once supported by eslint.
  // ext: '*.ts',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'no-console': [
      'warn',
      {
        allow: [
          'warn',
          'error',
          'info',
          'time',
          'timeEnd',
        ]
      }
    ],
    'quotes': [
      'warn',
      'single',
      {
        'allowTemplateLiterals': true,
      },
    ],
    'prefer-template': 'warn',
    'no-useless-concat': 'warn',
    'indent': [
      'warn',
      4,
    ],
    'no-mixed-spaces-and-tabs': [
      'warn',
      'smart-tabs',
    ],
    'semi': [
      'error',
      'always'
    ],
    'comma-dangle': [
      'error',
      {
        'arrays': 'never',
        'objects': 'always',
        'imports': 'never',
        'exports': 'never',
        'functions': 'never'
      }
    ],
    'no-multi-spaces': [
      "error",
      {
        ignoreEOLComments: false
      }
    ],
  }
};