/* jshint node: true */
'use strict';

var FastbootBuildPlugin = require('./lib/fastboot-build-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-fastboot-build',

  createDeployPlugin: function(options) {
    return new FastbootBuildPlugin({name: options.name});
  }
};
