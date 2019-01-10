/* eslint-env node */
'use strict';

module.exports = function() {
  let ENV = {
    build: {},
    rootURL: '/litreka/',
    locationType: 'hash',
    ghpages: {
      gitRemoteUrl: 'git@github.com:/nolaneo/litreka',
    }
  };
  return ENV;
};
