const model = require('./usersModel.js');

const controller = {
    getData: function(req, res, next) {
        let result = model.selectUsers();
        res.json(result);
    },
    insertRequest: function(req, res, next) {
        // Do sth
    },
    deleteRequest: function (req, res, next) {
        // Do sth
    },
    updateRequest: function (req, res, next) {
        // Do sth
    }
};

module.exports = controller;
