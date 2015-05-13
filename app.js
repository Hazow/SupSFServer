/**
 * Created by Anthony on 30/03/2015.
 */
/**
 * Load Modules
 */

var express = require('express');
var app     = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:63342");
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "Content-Type,Access-Control-Allow-Methods, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});
var http = require('http');
var server = http.createServer(app);
var path = require('path');
var io = require('socket.io')(server);
var morgan      = require('morgan');
var bodyParser  = require('body-parser');
global.mongoose = require('mongoose');

var router = express.Router();


/**
 * Variables
 */

var port = 8080;

var databaseURL = 'mongodb://:@localhost/SupSFServer';
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Database connection
 */

mongoose.connect(databaseURL);

var db = mongoose.connection;

db.on('error',function(){console.log('connection error')});
db.once('open',function(){console.log('connection open')});

/**
 * Middlewares
 */
app.use(function(request,response,next){
    request.db = db;
    next();
});

//Morgan
app.use(morgan('dev'));

//BodyParser
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Routing
 */

require('./router')(router);
app.use(router);
// Add headers
//CORS middleware


/**
 *
 * SOCKET IO
 */
var allMessages=[];
var MessageRepository = require('./message.js');
MessageRepository.findAll(function(messages){
    allMessages = messages;
},function(err){
    console.log(err);
});
var usersOnline = [];
var usersSearchFights=[];
var clients=[];
console.log(usersOnline);
/**
 * Launch Server
 */

server.listen(port);
console.log('Server is ready on port ' + port);

io.sockets.on('connection', function (socket) {

    socket.user=null;
    socket.on('login', function (user) {
        var goOne=true;
        usersOnline.forEach(function(entry){
            console.log("1:"+entry._id+"=="+user._id);
           if(entry._id==user._id){
               socket.emit('alreadyOnline',user);
                goOne=false;
           }
        });
        if(goOne){
            socket.user=user;
            clients.push(socket);
            //user.socket=socket;
            usersOnline.push(socket.user);
            console.log(user.pseudo+ " connected.");
            socket.emit('allMessages',allMessages);
            socket.emit('listUserOnline',usersOnline);
            socket.broadcast.emit('newUserOnline',socket.user);
        }

    });

    socket.on('message', function (message) {
        console.log(message);
        if(message.body.indexOf('<script>')>-1){
            message.body="tried to inject javascript";
        }
        allMessages.push(message);
        socket.emit('message',message);
        socket.broadcast.emit('message',message);

    });

    socket.on('disconnect', function () {
        if(!socket.user) return;
        usersOnline.forEach(function(entry){
            if(entry.pseudo==socket.user.pseudo){
                usersOnline.splice(usersOnline.indexOf(entry),1);
                socket.broadcast.emit('disconnectUserOnline',socket.user);
            }
        });
        clients.forEach(function(soc){
            if(soc.user.pseudo==socket.user.pseudo){
                clients.splice(clients.indexOf(soc),1);
            }
        });
        console.log(socket.user.pseudo + " disconnected")
    });


    socket.on('searchFight', function() {
        var find=false;
        usersSearchFights.forEach(function(user) {
            if(user && !find){
                clients.forEach(function(soc){
                    if(soc.user.pseudo==user.pseudo){
                        find=true;
                        usersSearchFights.splice(usersSearchFights.splice(user),1);
                        socket.emit('findFight',{ user : user, pos : "right"});
                        soc.emit('findFight',{ user : socket.user, pos : "left"});
                        console.log(socket.user.pseudo+" will fight "+soc.user.pseudo);
                    }
                });
            }
        });
        if(!find){
            usersSearchFights.push(socket.user);
            console.log(socket.user.pseudo+" mis en liste d'attente");
            socket.emit('waitingFight',"");
        }
    });

    socket.on('stopSearchFight', function() {
        usersSearchFights.forEach(function(user) {
            if(user.pseudo==socket.user.pseudo){
                usersSearchFights.splice(usersSearchFights.splice(user),1);
            }
        });
    });

    socket.on('askForFight',function(user){
        clients.forEach(function(soc){
            if(soc.user._id==user._id){
                soc.emit('askForFight',socket.user);
            }
        });
    });

    socket.on('goFight', function(user) {
        clients.forEach(function(soc){
            if(soc.user._id==user._id){
                soc.emit('responseForFight',{ opponent: socket.user, res: true });
            }
        });
    });

    socket.on('cancelFight', function(user) {
        clients.forEach(function(soc){
            if(soc.user._id==user._id){
                soc.emit('responseForFight',{ opponent: socket.user, res: false });
            }
        });
    });

    socket.on('event', function(data) {
        clients.forEach(function(soc){
            if(soc.user._id==data.opponent._id){
                soc.emit('eventOpponent',data.event);
            }
        });
        socket.emit('event', data.event);
    });

    socket.on('correctLatency', function(data) {
        clients.forEach(function(soc){
            if(soc.user._id==data.opponent._id){
                soc.emit('correctLatency',{
                    x:data.x,
                    y:data.y,
                    minX:data.minX,
                    maxX:data.maxX,
                    minY:data.minY,
                    maxY:data.maxY,
                    status:data.status,
                    position:data.position,
                    specialload:data.specialload,
                    or:data.or,
                    frame:data.frame,
                    life:data.life,
                    isHurting:data.isHurting
                });
            }
        });
    });

    socket.on('stopFight', function(opponent) {
        clients.forEach(function(soc){
            if(soc.user._id==opponent._id){
                soc.emit('stopFight');
            }
        });
    });

    socket.on('majLeaderBoard', function(user){
        socket.emit('majLeaderBoard',user);
        socket.broadcast.emit('majLeaderBoard',user);
    });

});

