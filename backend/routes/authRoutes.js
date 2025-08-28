const router = require('express').Router();
const auth = require('../middleware/auth');
const { register, registerValidators, login, loginValidators, profile } = require('../controllers/authController');

router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);
router.get('/profile', auth, profile);

module.exports = router;


