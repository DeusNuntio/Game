// @ts-check
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

/**
 * Import-boundary enforcement: gameplay/ai/data/core/meta must stay renderer-agnostic.
 * They may never import from rendering/audio/ui/input/save — those layers may import
 * gameplay's types, never the reverse. This is the mechanical guarantee behind
 * "Grafik darf niemals direkt mit Spiellogik gekoppelt sein".
 */
const forbiddenForPureLayers = [
  { group: ['@/rendering', '@/rendering/*', '**/rendering/*'], message: 'Gameplay/AI/Data code must not import rendering.' },
  { group: ['@/audio', '@/audio/*', '**/audio/*'], message: 'Gameplay/AI/Data code must not import audio.' },
  { group: ['@/ui', '@/ui/*', '**/ui/*'], message: 'Gameplay/AI/Data code must not import ui.' },
  { group: ['@/input', '@/input/*', '**/input/*'], message: 'Gameplay/AI/Data code must not import input.' },
  { group: ['@/save', '@/save/*', '**/save/*'], message: 'Gameplay/AI/Data code must not import save (save imports gameplay, not vice versa).' },
];

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'off',
    },
  },
  {
    files: [
      'src/core/**/*.ts',
      'src/gameplay/**/*.ts',
      'src/ai/**/*.ts',
      'src/data/**/*.ts',
      'src/meta/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: forbiddenForPureLayers }],
    },
  },
];
