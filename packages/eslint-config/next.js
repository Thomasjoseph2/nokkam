import prettier from 'eslint-config-prettier';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { ignores, sharedRules } from './base.js';

// eslint-config-next registers the typescript-eslint plugin itself, so only rules are shared here.
export default [ignores, ...nextVitals, ...nextTs, { rules: sharedRules }, prettier];
