/**
 * Schema
 */
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

UserSchema = new Schema({
    pseudo: {type: String, required: true},
    password: {type: String, required: true},
    win: {type: String, default: 0},
    lose: {type: String, default: 0},
    fights: [{ results: Boolean, versus: {type: ObjectId, ref: 'UserSchema' }}],
    created: {type: Date, default: Date.now}
});


/**
 * Model
 */

var UserModel = mongoose.model('User',UserSchema);

/**
 * Repository
 */
var repository = {

    findAll : function(successCallback,errorCallback) {

        errorCallback = errorCallback || function(){};

        UserModel.find(function(err,users){
            err ? errorCallback(err) : successCallback(users);
        });

    },

    find: function(who,successCallback,errorCallback) {

        errorCallback = errorCallback || function(){};

        UserModel.findOne(who,function(err,user){
            err ? errorCallback(err) : successCallback(user);
        });

    },

    save : function(userItem,successCallback,errorCallback) {

        successCallback = successCallback || function(){};
        errorCallback   = errorCallback   || function(){};

        var user = new UserModel(userItem);

        user.save(function(err,user){
            err ? errorCallback(err) : successCallback(user);
        });

    },

    update : function(id,userItem,successCallback,errorCallback) {

        successCallback = successCallback || function(){};
        errorCallback   = errorCallback   || function(){};

        UserModel.findByIdAndUpdate(id,userItem,null,function(err,data){
            err ? errorCallback(err) : successCallback(data);
        });


    },

    delete : function(id,callback){

        callback = callback || function(){};

        UserModel.findByIdAndRemove(id,function(err,nbDeleted){
            callback(err,nbDeleted);
        });
    }

};

/**
 * Export
 */

module.exports = repository;