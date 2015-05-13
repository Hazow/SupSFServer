var UserRepository = require('./user.js');
var MessageRepository = require('./message.js');
var qs = require('querystring');
var crypto = require('crypto');
module.exports = {

    getUsers : function(request,response,next){
        console.log('getUsers');
        UserRepository.findAll(function(users){
            console.log(users);
            response.json(users);
        })
    },

    getMessages : function(request,response,next){
        console.log('getUsers');
        MessageRepository.findAll(function(msgs){
            console.log(msgs);
            response.json(msgs);
        })
    },

    isLogin : function(req,response,next){
        console.log('isLogin');
        var data='';
        req.on('data',function(chunk){
            data += chunk;
        });
        req.on('end', function() {
            var user = JSON.parse(data);
            if(!isEmpty(user)){
                var hash = crypto.createHmac('sha512', 'datekey')
                hash.update(user.password);
                user.password = hash.digest('hex');
                UserRepository.find(user,function(user){
                    if(user!=null){
                        response.json(user);
                    }else{
                        response.send(null);
                    }

                },function(err){
                    console.log("Pas de réponse : "+err);
                    response.send(err);
                });
            }else{
                response.json(null);
            }

        });
    },

    addUsers : function(req,response,next){
        console.log('addUsers');
        var data='';
        req.on('data',function(chunk){
            data += chunk;
        });
        req.on('end', function() {
            //customer=data;
            var user = JSON.parse(data);

            console.log(user);
            var exist=false;
            UserRepository.findAll(function(users){
                users.forEach(function(entity){
                    if(entity.pseudo==user.pseudo){
                        exist=true;
                    }
                });
                if(!exist){
                    var hash = crypto.createHmac('sha512', 'datekey')
                    hash.update(user.password);
                    user.password = hash.digest('hex');
                    UserRepository.save(user,function(user){
                        console.log("Insertion réussi");
                        response.json(user);
                    },function(err){
                        console.log("Insertion failed : "+err);
                        response.send(err);
                    });
                }else{
                    response.send(false);
                }
            });



        });

    },

    addMessages : function(req,response,next){
        console.log('addMessages');
        var data='';
        req.on('data',function(chunk){
            data += chunk;
        });
        req.on('end', function() {
            var msg = JSON.parse(data);
            if(msg.body.indexOf('<script>')>-1){
                msg.body="tried to inject javascript";
            }
            console.log(msg);
            MessageRepository.save(msg,function(msg){
                console.log("Insertion réussi");
                response.json(msg);
            },function(err){
                console.log("Insertion failed : "+err);
                response.send(err);
            });
        });

    },

    updateUsers : function(req,response,next){
        var data='';
        req.on('data',function(chunk){
            data += chunk;
        });
        req.on('end', function() {
            console.log(data);
            var user = JSON.parse(data);
            id=user._id;
            console.log('updateCustomer : id='+id);
            UserRepository.update(id,user,function(user){
                console.log("Update réussi");
                response.json(user);
            },function(err){
                console.log("Update failed" +err);
                response.send(err);
            });

        });
    },

    deleteUsers : function(req,response,next){

            id=req.params.id;
            console.log('deleteUser : id='+id);
            UserRepository.delete(id,function(err,deleted){
                response.json({
                    id      : id,
                    success : deleted && !err
                });
            })



    }
};

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}