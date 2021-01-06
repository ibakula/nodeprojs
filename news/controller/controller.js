const model = require('../model/model.js');

const controller = {
    getData: (req, res, route_name, next) => {
        let that = this;
        next = {
            handleRequest: controller.handleRequest,
            request: req,
            respond: res
        }
        model.selectData(route_name, next);
    },
    insertRequest: (req, res, route_name) => {
        next = {
            handleRequest: controller.handleRequest,
            request: req,
            respond: res
        }
        model.insertData(route_name, next);
    },
    deleteRequest: (req, res, route_name, next) => {
        next = {
            handleRequest: controller.handleRequest,
            request: req,
            respond: res
        }
        model.removeData(route_name, next);
    },
    updateRequest: (req, res, route_name, data, next) => {
        next = {
            handleRequest: controller.handleRequest,
            request: req,
            respond: res
        }
        model.updateData(route_name, next);
    },
    handleRequest: (req, res, data, next) => {
        res.json(data != undefined ? data : {});
    }
};

module.exports = controller;
