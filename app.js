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
           if(entry.pseudo==user.pseudo){
               socket.emit('alreadyOnline',user);
                goOne=false;
           }
        });
        if(goOne){
            socket.user=user;
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
        console.log(socket.user.pseudo + " disconnected")
    });

});

