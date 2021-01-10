const model = require('../model/model.js');

const controller = {
    getData: (req, res, route_name, next) => {
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
    },
    handleLogin: (req, res, data, next) => {
        model.userLogin(req, res, 
            controller.handleRequest);
    },
    handleLogout: (req, res, data, next) => {
        res.cookie.clearCookie('apiSession', { path: '/api' });
        req.session.destroy(err => {
            if (err) {
                console.error("Could not destroy session");
                console.error(err.message);
            }
            else {
                 req.session.regenerate(err => {
                     if (err) {
                         console.error("Logout handler failur to generate a new session");
                         console.error(err.message);
                     }
                 });
            }
        });

        controller.handleRequest(req, res, { 'result' : 'Success!' }, next);
    }
};

module.exports = controller;
