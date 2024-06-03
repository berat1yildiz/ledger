const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('winston');
const Sequelize = require('sequelize');
const authorize = require('../middleware/authorization');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, passwordHash: hashedPassword });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    logger.error(err);

    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();

    res.status(200).json(users);
  } catch (err) {
    logger.error(err);

    next(err);
  }
};

const giveCredit = async (req, res, next) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.balance += amount;
    await user.save();

    res.status(200).json({ message: 'Credit added successfully', user });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllBalances = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: ['email', 'balance'] });
    res.status(200).json(users);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const transferCredit = async (req, res, next) => {
  try {
    const { senderId, receiverId, amount } = req.body;
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance for transfer' });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: 'Credit transferred successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserBalanceAtTime = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const timestamp = req.params.timestamp;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'balance'],
      where: {
        createdAt: {
          [Sequelize.Op.lte]: new Date(timestamp)
        }
      },
      order: [['createdAt', 'DESC']],
      limit: 1
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserBalance = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId, {
      attributes: ['email', 'balance']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { 
  register,
  getAllUsers,
  giveCredit,
  getAllBalances,
  transferCredit,
  getUserBalanceAtTime,
  getUserBalance
};
