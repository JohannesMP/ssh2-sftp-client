'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiSubset = require('chai-subset');
const chaiAsPromised = require('chai-as-promised');
const {join} = require('path');
const {
  config,
  getConnection,
  closeConnection
} = require('./hooks/global-hooks');
const {permissionSetup, permissionCleanup} = require('./hooks/permission-hook');

chai.use(chaiSubset);
chai.use(chaiAsPromised);

describe('Bad permission tests', function() {
  let hookSftp, sftp;

  before(function(done) {
    setTimeout(function() {
      done();
    }, config.delay);
  });

  before('FastPut setup hook', async function() {
    hookSftp = await getConnection('fastput-hook');
    sftp = await getConnection('fastput');
    await permissionSetup(hookSftp, config.sftpUrl, config.localUrl);
    return true;
  });

  after('FastPut cleanup hook', async function() {
    await permissionCleanup(hookSftp, config.sftpUrl);
    await closeConnection('fastput', sftp);
    await closeConnection('fastput-hook', hookSftp);
    return true;
  });

  describe('No access to local file', function() {
    it('fastPut throws exception', function() {
      return expect(
        sftp.fastPut(
          join(config.localUrl, 'no-access.txt'),
          join(config.sftpUrl, 'no-access1.txt')
        )
      ).be.rejectedWith('permission denied');
    });

    it('put throws exception', function() {
      return expect(
        sftp.put(
          join(config.localUrl, 'no-access.txt'),
          join(config.sftpUrl, 'no-access1.txt')
        )
      ).be.rejectedWith('permission denied');
    });
  });

  describe('No access to remote file', function() {
    it('fastget throws exception', function() {
      return expect(
        sftp.fastGet(
          join(config.sftpUrl, 'no-access-get.txt'),
          join(config.localUrl, 'no-access-fastget.txt')
        )
      ).be.rejectedWith('Permission denied');
    });

    it('get throws exception', function() {
      return expect(
        sftp.get(
          join(config.sftpUrl, 'no-access-get.txt'),
          join(config.localUrl, 'no-access-get.txt')
        )
      ).be.rejectedWith('Permission denied');
    });
  });
});