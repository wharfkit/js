process.env.TS_NODE_PROJECT = process.env.TS_NODE_PROJECT || './test/tsconfig.json'
process.env.MOCK_DIR = process.env.MOCK_DIR || './test/data'

module.exports = {
    ui: 'tdd',
    require: ['ts-node/register', 'tsconfig-paths/register'],
    extension: ['ts'],
    spec: ['test/tests/**/*.ts'],
    timeout: 120000,
    slow: 5000,
}
