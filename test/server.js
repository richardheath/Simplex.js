var http = require('http');
var path = require('path');
var express = require('express');
var router = express();
var server = http.createServer(router);
var bodyParser = require('body-parser');

// Routes for commands
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.post('/cmd', function(req, res) {
    res.contentType('application/json');
    processCommands(req.body, function(objResult) {
        res.writeHead(200);
        res.write(JSON.stringify(objResult));
        res.end();
    });
});
//router.get('/cmd*', function(req, res) { }); // Not implemented yet

// Routes for static files
router.get('/simplex.js', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../simplex.js'));
});
router.use(express.static(path.resolve(__dirname, 'web')));
router.use('/lib', express.static(path.resolve(__dirname, 'lib')));

// Initial test data used in commands
var users = [
    { name: 'Richard', balance: 1000 },
    { name: 'Jona', balance: 2000 }
];

var commands = {
    getUser: function (params, callback) {
        if(params.id > users.length || params.id < 0) {
            return {
                error: 'user does not exist.'
            };
        }

        callback(users[params.id]);
    },
    addUser: function (params, callback) {
        users.push(params);
        callback( { success: true } );
    }
};

// Commands helper functions
function processCommands(input, callback) {
    var cmd, cmdName,
        res = {},
        len = 0,
        complete = 0,
        completeFn = function(cmdName, cmdRes) {
            complete += 1;
            res[cmdName] = cmdRes;

            if(len === complete) {
                callback(res);
            }
        };

    for(cmdName in input) {
        if (!input.hasOwnProperty(cmdName)) {
            continue;
        }

        len += 1;
        cmd = commands[cmdName];
        if(!cmd) {
            res[cmdName] = {
                error: true,
                message: 'Command not found.'
            };
            complete += 1;
        } else {
            runCommand(cmd, cmdName, input[cmdName], completeFn);
        }
    }

    if(len === complete) {
        callback(res);
    }
}
function runCommand(cmd, cmdName, params, callback) {
    cmd(params, function(cmdRes) {
        callback(cmdName, cmdRes);
    });
}

server.listen(80, '0.0.0.0', function(){
    console.log('Simplex Framework Test\n => http://localhost:80 /\nCTRL + C to shutdown');
});