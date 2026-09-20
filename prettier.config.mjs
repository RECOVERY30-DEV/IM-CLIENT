/** @type {import('prettier').Config} */
const config = {
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
  printWidth: 100,
  proseWrap: 'preserve',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  tailwindFunctions: ['clsx', 'cn', 'cva'],
  tailwindStylesheet: './app/globals.css',
  trailingComma: 'all',
  useTabs: false,
}

export default config
