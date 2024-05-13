const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.post('/register', UserController.register);
router.get('/users', UserController.getAllUsers);
router.post('/users/credit', UserController.giveCredit);
router.get('/users/balances', UserController.getAllBalances);
router.post('/users/transfer', UserController.transferCredit);
router.get('/users/:userId/balance/:timestamp', UserController.getUserBalanceAtTime);

module.exports = router;
