import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const transcendental = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh',
  'exp', 'expm1', 'log', 'log1p', 'log2', 'log10', 'pow', 'sqrt', 'cbrt', 'hypot', 'random'];

export default tseslint.config(
  { ignores: ['**/.claude/**', '**/dist/**', '**/dev-dist/**', '**/node_modules/**', '**/*.svelte', '**/*.generated.ts', '**/playwright-report/**', '**/test-results/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { console: 'readonly', process: 'readonly', URL: 'readonly' } },
  },
  {
    // The painter runs inside Chromium at build time (packages/assets/scripts/render-art.mjs).
    files: ['packages/assets/scripts/paint.browser.js'],
    languageOptions: { globals: { document: 'readonly', window: 'readonly' } },
  },
  {
    // CLAUDE.md §7: core is pure — no clock, no randomness, no I/O, no transcendental maths,
    // no imports from anywhere (GAME_RULES R12).
    files: ['packages/core/src/**/*.ts'],
    rules: {
      'no-restricted-globals': ['error',
        ...['Date', 'performance', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'fetch',
          'window', 'document', 'navigator', 'localStorage', 'indexedDB', 'crypto', 'process',
          'console', 'XMLHttpRequest', 'WebSocket'].map((name) => ({ name, message: 'core is pure (CLAUDE.md §7).' })),
      ],
      'no-restricted-properties': ['error',
        ...transcendental.map((property) => ({ object: 'Math', property, message: 'core is integer-only and deterministic (GAME_RULES R12).' })),
      ],
      'no-restricted-imports': ['error', { patterns: [{ regex: '^(?!\\./)', message: 'core imports nothing (CLAUDE.md §2).' }] }],
    },
  },
);
