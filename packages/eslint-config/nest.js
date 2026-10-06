import globals from 'globals';
import tseslint from 'typescript-eslint';
import base from './base.js';

/**
 * NestJS rules. Type imports must stay as value imports for classes used in
 * constructor injection (emitDecoratorMetadata needs the runtime reference),
 * so consistent-type-imports is relaxed here.
 */
export default tseslint.config(...base, {
  languageOptions: { globals: { ...globals.node, ...globals.jest } },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'off',
  },
});
