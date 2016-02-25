'use strict';

var DeployPlugin = require('ember-cli-deploy-plugin');
var path = require('path');

module.exports = DeployPlugin.extend({
  defaultConfig: {
    environment: 'production',
    outputPath: path.join('tmp', 'fastboot-dist')
  },

  build: function() {
    var outputPath = this.readConfig('outputPath');
    var self = this;

    return this.buildFastBoot(outputPath)
      .then(function(files) {
        return {
          fastbootDistDir: outputPath,
          fastbootDistFiles: files || []
        };
      })
      .catch(function(error) {
        self.log('build failed', { color: 'red' });
        return Promise.reject(error);
      });
  },

  buildFastBoot: function(outputPath) {
    var buildEnv   = this.readConfig('environment');

    this.log('building fastboot app to `' + outputPath + '` using buildEnv `' + buildEnv + '`...', { verbose: true });

    process.env.EMBER_CLI_FASTBOOT = true;

    var Builder  = this.project.require('ember-cli/lib/models/builder');

    var builder = new Builder({
      ui: this.ui,
      outputPath: outputPath,
      environment: buildEnv,
      project: this.project
    });

    return builder.build()
      .finally(function() {
        process.env.EMBER_CLI_FASTBOOT = false;
        return builder.cleanup();
      })
      .then(this._logSuccess.bind(this, outputPath));
  },

  _logSuccess: function(outputPath) {
    var glob = require('glob');
    var self = this;
    var files = glob.sync('**/**/*', { nonull: false, nodir: true, cwd: outputPath });
    var Promise = require('rsvp').Promise;

    if (files && files.length) {
      files.forEach(function(path) {
        self.log('✔  ' + path, { verbose: true });
      });
    }
    self.log('fastboot build ok', { verbose: true });

    return Promise.resolve(files);
  }
});

