import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** Rules shared by every TypeScript package (plugins are registered by the presets). */
export const sharedRules = {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  'no-console': 'error',
  eqeqeq: ['error', 'smart'],
};

export const ignores = { ignores: ['dist/**', '.next/**', 'coverage/**', 'node_modules/**'] };

export default tseslint.config(
  ignores,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { rules: sharedRules },
  prettier,
);
