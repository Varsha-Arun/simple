'use strict';

const { logger } = require('@azure/identity');
const { call } = require('backoff');

var spawn = require('child_process').spawn;
var _ = require('underscore');

var self = executeRemoteUtils;
module.exports = self;

function executeRemoteUtils() {
  console.log(util.format('Initializing %s', self.name));
}

/*
async function _run_in_child(command, args, callback) {
  var cmd = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  console.log('_run_in_child Varsha cmd', cmd);
  cmd.stdout.on('data',
    function (data) {
      _.each(data.toString().split('\n'),
        function (consoleLine) {
          if (!_.isEmpty(consoleLine)) {
            console.log('_run_in_child Varsha Success data: ', consoleLine);
            logger.error('logger _run_in_child Varsha Success data: ', consoleLine);
          }
        }
      );
      callback(data, null);
    }
  );

  cmd.stderr.on('data',
    function (err) {
      console.log('_run_in_child Varsha Error data :', err.toString());
      logger.error('logger _run_in_child Varsha Error data :', err.toString());
      return callback(null, err)
    }
  );

  cmd.on('close',
    function (exitcode, signal) {
      var err;
      logger.error('logger _run_in_child Varsha Exit exitcode signal',  exitcode, signal);
      if (exitcode > 0 || signal) {
        err = util.format('%s failed with error code %s',
          cmd, exitcode || signal);
        console.log('_run_in_child Varsha Close err: ', err);
        logger.error('logger _run_in_child Varsha Exit err: ', err);
        return callback(null, err);
      } else {
        console.log('_run_in_child Varsha exitcode: ', exitcode);
        return callback(exitcode, null);
      }
    }
  );
}
*/


async function _run_in_child(command, args) {
  var cmd = spawn(command, args);

  let data = "";
    for await (const chunk of cmd.stdout) {
      console.log('stdout chunk: '+chunk);
      data += chunk;
    }

  let error = "";
    for await (const chunk of cmd.stderr) {
        console.error('stderr chunk: '+chunk);
        error += chunk;
    }

  const exitCode = await new Promise( (resolve, reject) => {
      cmd.on('close', resolve);
  });

  if( exitCode) {
    throw new Error( `subprocess error exit ${exitCode}, ${error}`);
  }

  return data;
}

/**
 * This global function does the following operations:
 1. Copies any file to remote server
 2. Executes that file
 * @param {*} privateIP
 * @param {*} sshPort
 * @param {*} sshUser
 * @param {*} privateKey
 * @param {*} sourceFiles
 * @param {*} destinationPath
 */

 executeRemoteUtils.copy =
 async function copyFilesToRemoteServer(privateIP, sshPort, sshUser,
  privateKey, sourceFiles, destinationPath, callback) {
    var args = [];
    if(privateKey) {
      args.push('-i');
      args.push(privateKey);
    }
    args.push('-P ' + sshPort);
    args.push('-o StrictHostKeyChecking=no');
    args.push('-o NumberOfPasswordPrompts=0');
    args.push(sourceFiles);
    args.push( sshUser + '@' + privateIP + ':' + destinationPath);
    console.log('Varsha args -- scp', args);

    return await _run_in_child('scp', args);

    /*
    try {
      var data = await _run_in_child('scp', args);
      console.log("copy result:\n" + data);
      return callback(data, null);
    } catch (err) {
      console.error(err);
      return callback(null, err);
    }
  
    await _run_in_child('scp', args, function cb (data, err) {
      if(err) {
        console.log('Spawn failed: ', err);
        return callback(null, err);
      } else {
        console.log('_run_in_child------data for copy',data);
        return callback(data, null);
      }
  });
  */
}

/**
 * This global function does the following operations:
 1. Copies any file to remote server
 2. Executes that file
 * @param {*} privateIP
 * @param {*} sshPort
 * @param {*} sshUser
 * @param {*} privateKey
 * @param {*} remoteCmd
 * @param {*} remoteArgs
 * @param {*} callback
 */
 executeRemoteUtils.run =
 async function executeOnRemoteServer(privateIP, sshPort, sshUser,
  privateKey, remoteCmd, remoteArgs, callback) {
  var args = [];
  if(privateKey) {
    args.push('-i');
    args.push(privateKey);
  }
  args.push('-p ' + sshPort);
  args.push('-o StrictHostKeyChecking=no');
  args.push('-o NumberOfPasswordPrompts=0');
  args.push(sshUser + '@' + privateIP);
  args.push(remoteCmd + ' ' + remoteArgs);
  console.log('Varsha args -------------------------- ssh', args);

  return await _run_in_child('ssh', args);

/*
  try {
    var data = await _run_in_child('ssh', args);
    console.log("run result:\n" + data);
    return callback(data, null);
  } catch (err) {
    console.error(err);
    return callback(null, err);
  }

  await _run_in_child('ssh', args, function cb (data, err) {
    if(err) {
      console.log('Spawn failed: ', err);
      return callback(null, err);
    } else {
        console.log('_run_in_child------data for run',data);
        return callback(data, null);
    }
  });
  */
}

executeRemoteUtils.testLocal = 
async function testCommandsLocal(cmd, args, callback) {

  return await _run_in_child(cmd, args);
  /*
  try {
    var data = await _run_in_child(cmd, args);
    console.log("testLocal result:\n" + data);
    return callback(data, null);
  } catch (err) {
    console.error(err);
    return callback(null, err);
  }

  await _run_in_child(cmd, args, function cb(data, err) {
    if(err) {
      console.log('Spawn failed: ', err);
      return callback(null, err);
    } else {
        if (data) {
          console.log('_run_in_child------data for test local',data);
        }
        return callback(data, null);
    }
  });
  */
}
