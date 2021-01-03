const express = require('express');
const controller = require('./usersController.js');
const router = express.Router();

router.get('/', controller.getData);
router.get('/:id', controller.getDataForId);

router.post('/', controller.insertRequest);
router.put('/:id', controller.updateRequest);
router.delete('/:id', controller.deleteRequest);

module.exports = router;