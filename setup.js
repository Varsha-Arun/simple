'use strict';

module.exports = setup;
const executeRemote = require('./executeRemoteUtils.js');
let pemFileName = 'automation.pem';
let scriptsDir = path.join(__dirname);
let pemFilePath = null;
let VMIpAddress = process.env.STATIC_VM;
let sshPrivateKey = process.env.SSH_PRIVATE_KEY;

async function _createPemFileV2(who, sshPrivateKey) {
  var who = 'setUp|_createPemFile';
  logger.debug(who, 'Inside');
  pemFilePath = path.join(scriptsDir, pemFileName);
  console.log('Varsha Pem file Path : ', pemFilePath);

  try {
    await fsPromises.writeFile(pemFilePath, sshPrivateKey)
    console.log("Varsha File written successfully");
    console.log("Varsha The written file has"
        + " the following contents:");
  } catch(err) {
    console.error(err);
    return;
  }
}

async function _installAndConfigureJenkins(who, VMIpAddress) {
  who = who + '|_installAndConfigureJenkins';
  logger.info(who, 'Inside');

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

  /*
  await executeRemote.testLocal('cat', [pemFilePath], function cb(data, err) {
    if(err) {
      console.log('executeOnRemoteServer: ', err);
      return;
    } else {
      if(data) {
        _.each(data.toString().split('\n'),
          function (consoleLine) {
            if (!_.isEmpty(consoleLine)) {
              console.log('Varsha : consoleLine',consoleLine);
            }
          });
          return;
        } else {
          return;
        }
      }
  });


  await executeRemote.copy(VMIpAddress, '22', sshUser, pemFilePath, script, '/home/' + sshUser, async function cb(data, err) {
    if(err) {
      console.log('copyFilesToRemoteServer: ', err);
      return;
    } else {
      console.log('before----varsha----executeRemote.run');
      await executeRemote.run(VMIpAddress, '22', sshUser, pemFilePath, 'cat', script, function cb(data, err) {
          if(err) {
            console.log('executeOnRemoteServer: ', err);
            return;
          } else {
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
              return;
            } else {
              return;
            }
        }
    });
    if(data) {
        console.log(data);
        return;
    }
    }
  });
*/
  //sleep(30);

  
/*  executeRemote.copy(VMIpAddress, '22', sshUser, pemFilePath, script, '/home/' + sshUser, function cb(data, err) {
    if(err) {
      console.log('copyFilesToRemoteServer: ', err);
    } else {
      console.log('before----varsha----executeRemote.run');
      executeRemote.run(VMIpAddress, '22', sshUser, pemFilePath, 'cat', script, function cb(data, err) {
          if(err) {
            console.log('executeOnRemoteServer: ', err);
          } else {
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
        }
    });
    if(data) {
        console.log(data);
    }
    }
  });
*/
}
