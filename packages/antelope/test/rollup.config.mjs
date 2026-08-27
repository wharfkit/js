import {browserTestConfig} from '../../../browser-test.base.mjs'

export default browserTestConfig(import.meta.url, {
    testsDir: '.',
    output: 'test/browser.html',
    sourcemap: 'inline',
    browserProvider: true,
})
