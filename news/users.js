const express = require('express');
const controller = require('./usersController.js');
const router = express().Router();

router.get('/', controller.getData);
router.get('/:id', controller.getData);

router.post('/', constroller.insertRequest);
router.put('/:id', constroller.updateRequest);
router.delete('/:id', constroller.deleteRequest);


module.exports = router;

