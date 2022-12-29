'use strict';

module.exports = setup;
async function setup(callback) {
    await _installAndConfigureJenkins(VMIpAddress);
  } catch (err) {
    logger.error(who, 'Setup failed with error', util.inspect(err));
    return callback(err);
  }

  logger.debug(who, 'complete');
  callback();
}

const executeRemote = require('./executeRemoteUtils.js');
let pemFileName = 'automation.pem';
let scriptsDir = path.join(__dirname);
let pemFilePath = null;
let VMIpAddress = process.env.STATIC_VM;
let sshPrivateKey = process.env.SSH_PRIVATE_KEY;

async function _installAndConfigureJenkins(VMIpAddress) {

  await _createPemFileV2(who, sshPrivateKey);
  console.log('Varsha Race condition');
  let sshUser = process.env.SSH_USER;
  var scriptDir = path.join(__dirname);
  var filePath = path.join(scriptDir, '../../globalWrapper/installJenkins.sh');
  fsPromises.chmod(filePath, '777');
  let script = filePath;
  console.log('VMIpAddress--vars',VMIpAddress);
  console.log('sshUser',sshUser);
  console.log('pemFilePath',pemFilePath);
  console.log('script',script);

  console.log('Varsha Pem file Path : ', pemFilePath);


  try {
    var data = await executeRemote.testLocal('cat', [pemFilePath]);
    console.log("testLocal result:\n" + data);
  } catch (err) {
    console.error(err);
    return err;
  }

  try {
    var data = await executeRemote.copy(VMIpAddress, '22', sshUser, pemFilePath, script, '/home/' + sshUser);
    console.log(data);
  } catch (err) {
    console.error(err);
    return err;
  }

  try {
    var data = await executeRemote.run(VMIpAddress, '22', sshUser, pemFilePath, 'cat', script);
    console.log(data);
    if(data) {
      _.each(data.toString().split('\n'),
        function (consoleLine) {
          if (!_.isEmpty(consoleLine)) {
            console.log('consoleLine-----run--vars',consoleLine);
            if(consoleLine.includes('JENKINS_API_TOKEN=')) {
              console.log('consoleLine ------------testvarsha',consoleLine);
              var key = string.split('=')[1];
              console.log('key----vars',key);
            }
          }
        }
      );
    }
  } catch (err) {
    console.error(err);
    return err;
  }
