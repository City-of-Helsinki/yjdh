module.exports = {
  presets: ['next/babel', ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]],
  plugins: [['styled-components', { ssr: true }]],
};
