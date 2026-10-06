import next from '@nokkam/eslint-config/next';

const config = [...next, { ignores: ['.next/**', 'next-env.d.ts'] }];

export default config;
