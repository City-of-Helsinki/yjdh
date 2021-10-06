module.exports = {
  presets: ['next/babel', ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]],
  plugins: [
    ['styled-components', { ssr: true }],
    ['import', {
      'libraryName': 'react-use',
      'libraryDirectory': 'lib',
      'camel2DashComponentName': false
    }
  ]],
};
