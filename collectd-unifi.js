#!/usr/bin/env node
'use strict';

const prompt = require('prompt-sync')(),
    _ = require('lodash'),
    bluebird = require('bluebird'),
    ubiquitiUnifi = require('ubiquiti-unifi');

process.title = 'discover-unifi';

let args = process.argv;
args.shift(); //remove node
args.shift(); //remove script

var unifiConfig = { ignoreSsl: true };

if (args.length === 0 || args.indexOf('--help') >= 0) {
    process.stdout.write([
        '',
        '  Usage: discover-unifi [options]',
        '',
        '  Options:',
        '',
        '    --help      display this help',
        '    --version   print the version',
        '',
        '    --interval [def: 10]',
        '    --unifi host port [username] [password]',
        '',
        ''
    ].join('\n'));
    process.exit(0);

} else if (args.indexOf('--version') >= 0) {
    process.stdout.write(require('./package.json').version + '\n');
    process.exit(0);

}

var collectdInterval = 10;
var collectdIntervalIndex = args.indexOf('--interval');
if (collectdIntervalIndex >= 0) {
    collectdInterval = args.slice(collectdIntervalIndex + 1, collectdIntervalIndex + 1)[0];
}

var unifiIndex = args.indexOf('--unifi');
if (unifiIndex >= 0) {
    var expectedArgs = [ 'host', 'port', 'username', 'password' ];
    var e = 0;

    var unifiArgs = args.slice(unifiIndex + 1, unifiIndex + 5);
    //console.log('Parsing UniFi Args:', unifiArgs);

    for (var i = 0; i < unifiArgs.length; i++) {
        if (unifiArgs[i].substring(0, 2) !== '--') {
            unifiConfig[expectedArgs[e]] = unifiArgs[i];
            e++;
        } else {
            break;
        }
    }
    if (!unifiConfig.username) {
        var username = prompt('UniFi Username: ');
        unifiConfig[expectedArgs[e]] = username;
        e++;
    }
    if (!unifiConfig.password) {
        var password = prompt('UniFi Password: ', {echo:'*'});
        unifiConfig[expectedArgs[e]] = password;
    }

    unifiConfig.url = `http://${unifiConfig.host}`;
} else {
    process.stdout.write('--unifi is required input');
    process.exit(1);
}



function putVal(identifier, values) {
    var milliseconds = (new Date).getTime();
    process.stdout.write(`PUTVAL ${identifier} interval=${collectdInterval} ${milliseconds}:${values}\n`);
}


function getAssets() {
    return bluebird.coroutine(function *() {
        let unifi = yield ubiquitiUnifi(unifiConfig);
        let assets = [];

        let accessPoints = yield unifi.getAccessPoints();
        accessPoints.forEach(accessPoint => {
            assets.push({
                macaddress: accessPoint.mac.toUpperCase().replace(/:/g, '-')
            });
        });

        let clients = yield unifi.getClients();
        clients.forEach(client => {
            assets.push({
                macaddress: client.mac.toUpperCase().replace(/:/g, '-')
            });
        });

        return assets;
    })();
}

function printControllerStats() {
    return getAssets()
        .then(assets => {
            putVal(`${unifiConfig.host}/unifi_num_sta/ath_nodes`, assets.length);
        });
}


setInterval(() => {
    return printControllerStats();
}, collectdInterval * 1000);
