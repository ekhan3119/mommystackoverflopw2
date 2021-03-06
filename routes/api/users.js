const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys_dev');
const passport = require('passport');

//Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');



//Load User model
const User = require('../../models/User');


//@routes        Get api/users/test
// @description  Test users routes
//@access        Public
router.get('/test', (req, res) => res.json({ msg: " Users Works" }));

//@routes        Get api/users/register
// @description  Register users 
//@access        Public

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    //Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                return res.status(400).json({ email: 'Email already exists' });
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', //size
                    r: 'pg', //Rating
                    d: 'mm' //Default
                });
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                bycrypt.genSalt(10, (err, salt) => {
                    bycrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    });
                });
            }
        });
});

//@router  GET API/USERS/LOGIN
//@desc    Login User/ Return JWT Token
//@access Public

router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    //Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }


    const email = req.body.email;
    const password = req.body.password;

    //Find the user by email
    User.findOne({ email })
        .then(user => {
            //Check for user
            if (!user) {
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }
            //check Password
            bycrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        // User Matched
                        //Create JWT payload
                        const payload = { id: user.id, name: user.name, avator: user.avator }
                        //Sing Token
                        jwt.sign(payload,
                            keys.secretOrKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            });
                    } else {
                        errors.password = 'Password incorrect'
                        return res.status(400).json(errors);
                    }
                })
        });
});
//@router  GET API/USERS/current
//@desc    Return current user
//@access Private
router.get('/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
    });


module.exports = router;