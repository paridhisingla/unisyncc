const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
	if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { id: decoded.id, role: decoded.role };
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Token is not valid' });
	}
};


