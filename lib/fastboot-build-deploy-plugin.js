'use strict';

var DeployPlugin = require('ember-cli-deploy-plugin');
var path = require('path');
var fs = require('fs');

module.exports = DeployPlugin.extend({
  defaultConfig: {
    environment: 'production',
    distDir: function(context) {
      return context.distDir;
    },
    outputPath: path.join('tmp', 'fastboot-dist')
  },

  build: function() {
    var outputPath = this.readConfig('outputPath');
    var self = this;

    return this.buildFastBoot(outputPath)
      .then(function(files) {
        var distDir = self.readConfig('distDir');
        if (!fs.existsSync(distDir)) {
          //this is the scenario where there is only the fastboot build
          //and no traditional ember build step in the build pipeline
          //in that case the build files should go into the primary dist properties so downstream
          //steps don't have to look in a different place
          return {
            distDir: outputPath,
            distFiles: files || []
          };
        } else {
          return {
            fastbootDistDir: outputPath,
            fastbootDistFiles: files || []
          };
        }
      })
      .catch(function(error) {
        self.log('build failed', { color: 'red' });
        return Promise.reject(error);
      });
  },

  didBuild: function(context) {
    // For the scenario where users are opting to perform solely a fastboot build and no ember build step
    // lets not do rewriting

    var emberBuildAssetMapPath = path.join(context.distDir, 'assets/assetMap.json');
    if (!context.fastbootDistDir || !fs.existsSync(emberBuildAssetMapPath)) { return; }

    var fastbootBuildAsssetMapPath = path.join(context.fastbootDistDir, 'assets/assetMap.json');

    // Rewrite FastBoot index.html assets
    try {
      this.log('Rewriting the FastBoot index.html to leverage assets meant for client consumption', { verbose: true });
      var browserAssetMap = JSON.parse(fs.readFileSync(emberBuildAssetMapPath));
      var fastBootAssetMap = JSON.parse(fs.readFileSync(fastbootBuildAsssetMapPath));
      var fastbootIndexHtmlPath = path.join(context.fastbootDistDir, 'index.html');
      var prepend = browserAssetMap.prepend;

      var indexHTML = fs.readFileSync(fastbootIndexHtmlPath).toString();
      var newAssets = browserAssetMap.assets;
      var oldAssets = fastBootAssetMap.assets;

      for (var key in oldAssets) {
        var value = oldAssets[key];
        this.log('✔  replacing: ' + value, { verbose: true });
        indexHTML = indexHTML.replace(prepend + value, prepend + newAssets[key]);
      }

      fs.writeFileSync(fastbootIndexHtmlPath, indexHTML);
    } catch(e) {
      this.log('unable to rewrite assets: ' + e.stack, { verbose: true });
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

