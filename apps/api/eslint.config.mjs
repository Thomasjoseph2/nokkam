import nest from '@nokkam/eslint-config/nest';

export default [
  ...nest,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
];
