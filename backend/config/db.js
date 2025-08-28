const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
	try {
		mongoose.set('strictQuery', true);
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 15000,
		});
		console.log('MongoDB connected');
	} catch (err) {
		console.error('MongoDB connection error:', err.message);
		process.exit(1);
	}
};

module.exports = connectDB;


