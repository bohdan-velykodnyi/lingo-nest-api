export default {
  '*.json': (files) => files.map((file) => `yarn sort-json ${file} --write`),

  '*.{ts,tsx}': (files) => [
    `yarn prettier --write ${files.join(' ')}`,
    `yarn eslint ${files.join(' ')} --max-warnings=0`,
  ],
};
