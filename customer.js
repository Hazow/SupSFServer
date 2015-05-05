/**
 * Schema
 */

var schema = new mongoose.Schema({

    /*id: {type: mongoose.Schema.Types.ObjectId},*/
    firstname : { type : String, required : true },
    lastname  : { type : String, required : true },
    created  : { type :    Date , default : Date.now },
    website : { type :    String}
});

/**
 * Model
 */

var CustomerModel = mongoose.model('Customer',schema);

/**
 * Repository
 */

var repository = {

    findAll : function(successCallback,errorCallback) {

        errorCallback = errorCallback || function(){};

        CustomerModel.find(function(err,customers){
            err ? errorCallback(err) : successCallback(customers);
        });

    },

    save : function(customerItem,successCallback,errorCallback) {

        successCallback = successCallback || function(){};
        errorCallback   = errorCallback   || function(){};

        var customer = new CustomerModel(customerItem);

        customer.save(function(err,customer){
            err ? errorCallback(err) : successCallback(customer);
        });

    },

    update : function(id,customerItem,successCallback,errorCallback) {

        successCallback = successCallback || function(){};
        errorCallback   = errorCallback   || function(){};

        CustomerModel.findByIdAndUpdate(id,customerItem,null,function(err,data){
            err ? errorCallback(err) : successCallback(data);
        });


    },

    delete : function(id,callback){

        callback = callback || function(){};

        CustomerModel.findByIdAndRemove(id,function(err,nbDeleted){
            callback(err,nbDeleted);
        });
    }

};

/**
 * Export
 */

module.exports = repository;