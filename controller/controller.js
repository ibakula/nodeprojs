const model = require('../model/model.js');

const controller = {
    searchForTerm: (req, res, table, next) => {
        model.findInTable(req, res, table, controller.handleRequest);
    },
    selectCommentsByPostId: (req, res, next) => {
        model.selectCommentsDataByPostId(req, res, controller.handleRequest);
    },
    getLastTableId: (req, res, route_name, next) => {
        next = {
            handleRequest: controller.handleRequest,
            request: req,
            respond: res
        }
        model.selectDataEnd(route_name, next);
    },
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
    handleLogin: (req, res, next) => {
        model.userLogin(req, res, controller.handleRequest);
    },
    handleLogout: (req, res, next) => {
        res.clearCookie('sessionId', { path: '/api' });
        req.session.regenerate(err => {
            if (err) {
                console.error("Could not regenerate session");
                console.error(err.message);
            }
        });

        controller.handleRequest(req, res, { 'result' : 'Success!' }, next);
    },
    handleStatusRequest: (req, res, next) => {
        model.getUserStatus(req, res, controller.handleRequest);
    },
    handleGetPopularPosts: (req, res, next) => {
        model.getPopularPosts(req, res, controller.handleRequest);
    },
    handleGetRecommended: (req, res, next) => {
        model.getRecommendedPosts(req, res, controller.handleRequest);
    }
};

module.exports = controller;
