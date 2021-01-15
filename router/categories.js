const express = require('express');
const controller = require('../controller/controller.js');
const router = express.Router();

router.get ('/', (req, res, next) => {
    controller.getLastTableId(req, res, 'categories', next);
});
router.get('/:id', (req, res, next) => {
    controller.getData(req, res, 'categories', next);
});
router.post('/', (req, res, next) => {
    controller.insertRequest(req, res, 'categories', next);
});
router.put('/:id', (req, res, next) => {
    controller.updateRequest(req, res, 'categories', next);
});
router.delete('/:id', (req, res, next) => {
    controller.deleteRequest(req, res, 'categories', next);
});

module.exports = router;

