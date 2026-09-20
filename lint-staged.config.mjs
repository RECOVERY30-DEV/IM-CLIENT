const lintStagedConfig = {
  '*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{css,json,jsonc,md,mdx,yaml,yml}': 'prettier --write',
}

export default lintStagedConfig
