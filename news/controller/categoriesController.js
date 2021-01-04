const model = require('../model/model.js');

const controller = {
    getData: async function(req, res, next) {
        try {
            let result = model.selectData('categories', req.params.id);
            console.log("Serving categories data");
            res.json(result);
        }
        catch (err) {
            res.send("An error has occured!");
        }
    },
    insertRequest: async function(req, res, next) {
        try {
            insertData('categories', req.params);
            console.log("Executed an INSERT query");
            res.send("Success!");
        }
        catch (err) {
            res.send("An error has occured!");
        }
    },
    deleteRequest: async function (req, res, next) {
        try {
            model.removeData('categories', req.params.id);
            console.log("Executed a DELETE query");
            res.json(result);
        }
        catch (err) {
            res.send("An error has occured!");
        }
    },
    updateRequest: async function (req, res, next) {
        try {
            model.updateData(req.param.id, 'categories', req.body);
            console.log("Executed an UPDATE query");
            res.json(result);
        }
        catch (err) {
            res.send("An error has occured!");
        }
    }
};

module.exports = controller;
