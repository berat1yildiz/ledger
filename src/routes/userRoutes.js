const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authorize = require('../middleware/authorization');

router.post('/register', userController.register);
router.post('/credit', authorize(['user', 'admin']), userController.giveCredit);
router.post('/transfer', authorize(['user', 'admin']), userController.transferCredit);

router.get('/users', authorize('admin'), userController.getAllUsers);
router.get('/balances', authorize('admin'), userController.getAllBalances);
router.get('/balance/:userId', authorize(['user', 'admin']), userController.getUserBalance);
router.get('/balanceAtTime/:userId/:timestamp', authorize(['user', 'admin']), userController.getUserBalanceAtTime);

module.exports = router;
