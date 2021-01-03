const model = require('./postsModel.js');

const controller = {
    getData: function(req, res, next) {
        let result = model.selectPosts(('id' in req.params ? req.params.id : null));
        res.json(result);
    },
    insertRequest: function(req, res, next) {
        let message = model.insertData(req.body);
        if (message != null) {
            res.send(`Failure: ${message}`);
        }
        else {
            res.send("Success!");
        }
    },
    deleteRequest: function (req, res, next) {
        let message = model.removeData(req.params.id);
        if (message != null) {
            res.send(`Failure: ${message}`);
        }
        else {
            res.send("Success!");
        }
    },
    updateRequest: function (req, res, next) {
        let message = model.updateData(req.params.id, req.body);
        if (message != null) {
            res.send(`Failure: ${message}`);
        }
        else {
            res.send("Success!");
        }
    }
};

module.exports = controller;
