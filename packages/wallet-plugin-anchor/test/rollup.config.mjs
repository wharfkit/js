import {browserTestConfig} from '../../../browser-test.base.mjs'

export default browserTestConfig(import.meta.url, {
    libSource: true,
    browserFetch: true,
    resolveOptions: {extensions: ['.mjs', '.js', '.json', '.node', '.ts']},
})
