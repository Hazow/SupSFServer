/**
 * Schema
 */
var Schema = mongoose.Schema;

MessageSchema = new Schema({
    sender: {type: String, required: true},
    body: {type: String, required: true},
    date: {type: Date, default: Date.now}
});


/**
 * Model
 */

var MessageModel = mongoose.model('Message',MessageSchema);

/**
 * Repository
 */
var repository = {

    findAll : function(successCallback,errorCallback) {

        errorCallback = errorCallback || function(){};

        MessageModel.find(function(err,users){
            err ? errorCallback(err) : successCallback(users);
        });

    },

    find: function(who,successCallback,errorCallback) {

        errorCallback = errorCallback || function(){};

        MessageModel.findOne(who,function(err,user){
            err ? errorCallback(err) : successCallback(user);
        });

    },

    save : function(userItem,successCallback,errorCallback) {

        successCallback = successCallback || function(){};
        errorCallback   = errorCallback   || function(){};

        var user = new MessageModel(userItem);

        user.save(function(err,user){
            err ? errorCallback(err) : successCallback(user);
        });

    },

    update : function(id,userItem,successCallback,errorCallback) {

        successCallback = successCallback || function(){};
        errorCallback   = errorCallback   || function(){};

        MessageModel.findByIdAndUpdate(id,userItem,null,function(err,data){
            err ? errorCallback(err) : successCallback(data);
        });


    },

    delete : function(id,callback){

        callback = callback || function(){};

        MessageModel.findByIdAndRemove(id,function(err,nbDeleted){
            callback(err,nbDeleted);
        });
    }

};

/**
 * Export
 */

module.exports = repository;