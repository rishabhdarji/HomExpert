module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8'
};