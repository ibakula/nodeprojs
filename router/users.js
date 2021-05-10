const express = require('express');
const controller = require('../controller/controller.js');
const router = express.Router();

router.post('/search', (req, res, next) => {
   controller.searchForTerm(req, res, 'users', next);
});
router.post('/search/count', (req, res, next) => {
   controller.getMatchesCount(req, res, 'users', next);
});
router.post('/search/fromId/:fromId/:countLimit', (req, res, next) => {
   controller.searchForTerm(req, res, 'users', next);
});
router.post('/search/toId/:toId/:countLimit', (req, res, next) => {
   controller.searchForTerm(req, res, 'users', next);
});
router.get('/last', (req, res, next) => {
   controller.getLastTableId(req, res, 'users', next);
});
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

module.exports = router;
