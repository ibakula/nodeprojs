const express = require('express');
const controller = require('../controller/usersController.js');
const router = express.Router();

router.get('/:id', controller.getData);
router.post('/', controller.insertRequest);
router.put('/:id', controller.updateRequest);
router.delete('/:id', controller.deleteRequest);

module.exports = router;