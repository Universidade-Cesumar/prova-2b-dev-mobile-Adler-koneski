module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  testPathIgnorePatterns: ['/node_modules/', '/sysalmoxarifado/'],
  modulePathIgnorePatterns: ['<rootDir>/sysalmoxarifado/']
};