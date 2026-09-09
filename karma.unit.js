var DtsBundlePlugin = require('dts-bundle-webpack');
var libraryWebpackConfig = require('./webpack.config');

// The test bundle emits no declaration files, so the dts bundler has nothing
// to read and crashes the run.
var webpackConfig = Object.assign({}, libraryWebpackConfig, {
  plugins: libraryWebpackConfig.plugins.filter(function(plugin) {
    return !(plugin instanceof DtsBundlePlugin);
  }),
});

process.env.CHROME_BIN =
    process.env.CHROME_BIN || require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'src/**/*_test.ts',
      'src/test_util/**/*.ts',
    ],
    exclude: [],
    preprocessors: {
      '**/*.ts': ['webpack'],
    },
    webpack: webpackConfig,
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  })
}
