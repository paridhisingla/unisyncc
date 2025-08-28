module.exports = function errorHandler(err, req, res, next) {
	const status = err.status || 500;
	const message = err.message || 'Internal Server Error';
	const details = process.env.NODE_ENV === 'development' ? err.stack : undefined;
	res.status(status).json({ message, status, details });
};


