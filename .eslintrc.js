module.exports = {
    root: true,
    env: {
      browser: true,
      es2024: true,
      node: true,
      jest: true,
      webextensions: true
    },
    extends: [
      'eslint:recommended',
      'plugin:jsdoc/recommended'
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: [
      'jsdoc'
    ],
    rules: {
      // Error prevention
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      
      // Code style
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single', { 
        avoidEscape: true,
        allowTemplateLiterals: true 
      }],
      'semi': ['error', 'always'],
      
      // Best practices
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-return-await': 'error',
      'no-useless-return': 'error',
      
      // Documentation
      'jsdoc/require-jsdoc': ['warn', {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true
        }
      }],
      'jsdoc/require-description': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',
      
      // Chrome extension specific
      'no-restricted-globals': ['error', 'event', 'fdescribe'],
      'no-console': ['warn', { 
        allow: ['warn', 'error', 'info', 'debug'] 
      }]
    },
    globals: {
      chrome: 'readonly',
      compromise: 'readonly',
      pdfjsLib: 'readonly',
      mammoth: 'readonly'
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          returns: 'return'
        }
      }
    }
  };