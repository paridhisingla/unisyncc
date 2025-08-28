const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

function signToken(user) {
	return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
		expiresIn: '7d',
	});
}

const registerValidators = [
	body('name').notEmpty(),
	body('email').isEmail(),
	body('password').isLength({ min: 6 }),
	body('role').optional().isIn(['Admin', 'Teacher', 'Student']),
];

async function register(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { name, email, password, role = 'Student', department, year } = req.body;
		const exists = await User.findOne({ email });
		if (exists) return res.status(409).json({ message: 'Email already registered' });
		const user = await User.create({ name, email, password, role, department, year });
		const token = signToken(user);
		return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
	} catch (err) {
		return next(err);
	}
}

const loginValidators = [
	body('email').isEmail(),
	body('password').notEmpty(),
];

async function login(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { email, password } = req.body;
		const user = await User.findOne({ email }).select('+password');
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await user.comparePassword(password);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		const token = signToken(user);
		return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
	} catch (err) {
		return next(err);
	}
}

async function profile(req, res, next) {
	try {
		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
}

module.exports = { register, registerValidators, login, loginValidators, profile };


