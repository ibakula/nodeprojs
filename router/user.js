const express = require('express');
const controller = require('../controller/controller.js');
const router = express.Router();

router.post('/login', controller.handleLogin);
router.get('/logout', controller.handleLogout);
router.get('/status', controller.handleStatusRequest);

module.exports = router;
