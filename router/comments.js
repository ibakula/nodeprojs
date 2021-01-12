const express = require('express');
const controller = require('../controller/controller.js');
const router = express.Router();

router.get('/:id', (req, res, next) => {
    controller.getData(req, res, 'comments', next);
});
router.post('/', (req, res, next) => {
    controller.insertRequest(req, res, 'comments', next);
});
router.put('/:id', (req, res, next) => {
    controller.updateRequest(req, res, 'comments', next);
});
router.delete('/:id', (req, res, next) => {
    controller.deleteRequest(req, res, 'comments', next);
});

module.exports = router;
