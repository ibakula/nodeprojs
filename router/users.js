const express = require('express');
const controller = require('../controller/controller.js');
const router = express.Router();

router.get('/:id', (req, res, next) => {
    controller.getData(req, res, 'users', next);
});
router.post('/', (req, res, next) => {
    controller.insertRequest(req, res, 'users', next);
});
router.put('/:id', (req, res, next) => {
    controller.updateRequest(req, res, 'users', next);
});
router.delete('/:id', (req, res, next) => {
    controller.deleteRequest(req, res, 'users', next);
});

router.post('/login', controller.handleLogin);
router.post('/register', controller.handleRegister);

module.exports = router;
