module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },

  extends: ['airbnb-base', 'plugin:react/recommended', 'plugin:prettier/recommended'],

  plugins: ['react', 'react-hooks', 'import'],

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  rules: {
    'no-console': 'warn',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
        semi: true,
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        json: 'always',
      },
    ],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-alert': 'error',
  },

  overrides: [
    {
      files: ['vite.config.js'],

      rules: {
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['**/index.js', '**/index.jsx'],
      rules: {
        'no-restricted-exports': 'off',
        'import/extensions': 'off',
      },
    },
  ],

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      },
    },

    react: {
      version: 'detect',
    },
  },
};
