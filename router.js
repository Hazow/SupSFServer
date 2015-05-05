module.exports = function(router){

    var controller = require('./controller');

    router.route('/user')
        .get(controller.getUsers)
        .post(controller.addUsers)
        .put(controller.updateUsers);

    router.route('/msg')
        .get(controller.getMessages)
        .post(controller.addMessages);

    router.route('/isLogin')
        .post(controller.isLogin);

    router.route('/user/:id')
        .delete(controller.deleteUsers);

}