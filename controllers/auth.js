const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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',
  }
}));

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1];
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error'),
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: req.flash('error'),
  });
};

exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true');
  const { email, password } = req.body;
  User.findOne({ email })
  .then(user => {
    if (!user) {
      req.flash('error', 'User with that email does not exist!');
      return res.redirect('/login');
    }
    bcrypt.compare(password, user.password)
    .then(doMatch => {
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err) => {
          console.log(err);
          res.redirect('/');
        });
      }
      req.flash('error', 'Invalid password.');
      res.redirect('login');
    })
    .catch(err => { // This will only be executed is something goes wrong, NOT IF PASSWORDS DON'T MATCH
      console.log(err)
      res.redirect('/login');
    });
  })
  .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const {
    email,
    password,
    confirmPassword
  } = req.body;
  User.findOne({ email: email })
  .then(userDoc => {
    if (userDoc) {
      req.flash('error', 'E-Mail exists already!');
      return res.redirect('/signup');
    }
    return bcrypt
      .hash(password, 12)
      .then(hashedPassword => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] }
        });
        return user.save();
      })
      .then(result => {
        res.redirect('/login');
        return transporter.sendMail({
          to: email,
          from: 'milanemcr@gmail.com',
          subject: 'Signup succeeded',
          html: '<h1>You successfully signed up</h1>',
        });
      })
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  })
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset password',
    errorMessage: req.flash('error'),
  });
};

