const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, {req}) => {
        if (value === 'test@test.com') {
          throw new Error('This email address is forbidden');
        }
        return true
      }),
    body('password', 'Invalid password')
      .isLength({min: 5, max: 10})
      .isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!');
      }
      return true
    })
  ],
  authController.postSignup,
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getSetPassword);
router.post('/set-password', authController.postSetPassword);

module.exports = router;