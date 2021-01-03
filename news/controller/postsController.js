const model = require('../model/postsModel.js');

const controller = {
    getData: function(req, res, next) {
        model.selectPosts(null, res);
    },
    getDataForId: function(req, res, next) {
        model.selectPosts(req.params.id, res);
    },
    insertRequest: function(req, res, next) {
        model.insertData(req.body, res);
        res.send("Success!")
    },
    deleteRequest: function (req, res, next) {
        model.removeData(req.params.id, res);
        res.send("Success!")
    },
    updateRequest: function (req, res, next) {
        model.updateData(req.params.id, req.body, res);
        res.send("Success!")
    }
};

module.exports = controller;
