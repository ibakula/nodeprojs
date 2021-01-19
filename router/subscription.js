const controller = require('../controller/controller.js');
const router = require('express').Router();

router.get('/:id', (req, res, next) => {
    controller.getData(req, res, 'subscribers', next);
});
router.post('/', (req, res, next) => {
    controller.insertRequest(req, res, 'subscribers', next);
});
router.delete('/:id', (req, res, next) => {
    controller.deleteRequest(req, res, 'subscribers', next);
});

module.exports = router;
