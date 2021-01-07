const express = require('express');
const controller = require('../controller/controller.js');
const router = express.Router();

router.get('/:id', (req, res, next) => {
    controller.getData(req, res, 'posts', next);
});
router.post('/', (req, res, next) => {
    controller.insertRequest(req, res, 'posts', next);
});
router.put('/:id', (req, res, next) => {
    controller.updateRequest(req, res, 'posts', next);
});
router.delete('/:id', (req, res, next) => {
    controller.deleteRequest(req, res, 'posts', next);
});

module.exports = router;