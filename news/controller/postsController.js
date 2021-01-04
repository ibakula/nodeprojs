const model = require('../model/model.js');

const controller = {
    getData: async function(req, res, next) {
        try {
            let result = model.selectData('posts', req.params.id);
            console.log("Serving posts data");
            res.json(result);
        }
        catch (err) {
            res.send("An error has occured!");
        }
    },
    insertRequest: async function(req, res, next) {
        try {
            insertData('posts', req.params);
            console.log("Executed an INSERT query");
            res.send("Success!");
        }
        catch (err) {
            res.send("An error has occured!");
        }
    },
    deleteRequest: async function (req, res, next) {
        try {
            model.removeData('posts', req.params.id);
            console.log("Executed a DELETE query");
            res.json(result);
        }
        catch (err) {
            res.send("An error has occured!");
        }
    },
    updateRequest: async function (req, res, next) {
        try {
            model.updateData(req.param.id, 'posts', req.body);
            console.log("Executed an UPDATE query");
            res.json(result);
        }
        catch (err) {
            res.send("An error has occured!");
        }
    }
};

module.exports = controller;
