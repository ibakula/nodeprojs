const express = require('express');
const controller = require('../controller/controller.js');
const router = express.Router();

router.post('/search', (req, res, next) => {
   controller.searchForTerm(req, res, 'posts', next);
});
router.post('/search/count', (req, res, next) => {
   controller.getMatchesCount(req, res, 'posts', next);
});
router.post('/search/fromId/:fromId/:countLimit', (req, res, next) => {
   controller.searchForTerm(req, res, 'posts', next);
});
router.post('/search/toId/:toId/:countLimit', (req, res, next) => {
   controller.searchForTerm(req, res, 'posts', next);
});
router.post('/search/:fromId/:countLimit', (req, res, next) => {
   controller.searchForTerm(req, res, 'posts', next);
});
router.get('/last', (req, res, next) => {
   controller.getLastTableId(req, res, 'posts', next);
});
router.get('/popular', (req, res, next) => {
   controller.handleGetPopularPosts(req, res, next);
});
router.get('/recommended/:categoryId', (req, res, next) => {
   controller.handleGetRecommended(req, res, next);
});
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
