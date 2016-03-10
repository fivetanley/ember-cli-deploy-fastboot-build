# Ember CLI Deploy Fastboot Build

**This addon is currently compatible with Ember CLI Deploy 0.5.x only!**

# What is this?

An ember-cli-deploy plugin that builds the fastboot app to the local
file-system.

This plugin builds your application for FastBoot server-side rendering.

The code was mainly extracted from Tom Dale's [Ember CLI Deploy Elastic Beanstalk Plugin](https://github.com/tomdale/ember-cli-deploy-elastic-beanstalk).

In order to deploy the build generated from this addon to your FastBoot
server, install the [FastBoot Deploy middleware](https://github.com/habdelra/ember-fastboot-deploy) to your FastBoot server.

## Installation

`ember install ember-cli-deploy-fastboot-build`

## Options

* `environment` - `'production'`. The environment assets will be built in.
* `outputPath` - `'tmp/fastboot-dist'` - The location Fastboot assets will
be written to.

## ember-cli-deploy Hooks Implemented

For detailed information on what plugin hooks are and how they work, please refer to the [Plugin Documentation][plugin-documentation].

- `build`
- `didBuild`

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy pipeline. A plugin will implement one or more of the ember-cli-deploy's pipeline hooks.

For more information on what plugins are and how they work, please refer to the [Plugin Documentation][plugin-documentation].

[plugin-documentation]: http://ember-cli.github.io/ember-cli-deploy/plugins

## Development Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running Tests

* `npm test`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

