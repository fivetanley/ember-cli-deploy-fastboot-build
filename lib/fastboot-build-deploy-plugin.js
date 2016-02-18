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

  didBuild: function(context) {
    var fs = require('fs');
    self.log('old Assets', oldAssets);
    // Rewrite FastBoot index.html assets
    try {
      var browserAssetMap = JSON.parse(fs.readFileSync(context.distDir + '/assets/assetMap.json'));
      var fastBootAssetMap = JSON.parse(fs.readFileSync(context.fastbootDistDir + '/assets/assetMap.json'));
      var prepend = browserAssetMap.prepend;

      var indexHTML = fs.readFileSync(context.fastbootDistDir + '/index.html').toString();
      var newAssets = browserAssetMap.assets;
      var oldAssets = fastBootAssetMap.assets;

      for (var key in oldAssets) {
        var value = oldAssets[key];
        console.log(value);
        indexHTML = indexHTML.replace(prepend + value, prepend + newAssets[key]);
      }

      fs.writeFileSync(context.fastbootDistDir + '/index.html', indexHTML);
    } catch(e) {
      this.log('unable to rewrite assets: ' + e.stack, { verbose: true });
    }

    // Rewrite FastBoot manifest
    try {
      var fastBootAssetMap = JSON.parse(fs.readFileSync(context.fastbootDistDir + '/assets/assetMap.json'));

      var packagePath = path.join(context.fastbootDistDir, 'package.json');
      var package = require(packagePath);
      console.log(package);
      console.log(fastBootAssetMap);
    } catch (e) {

    }
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

