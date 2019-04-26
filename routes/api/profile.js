const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load validation
const validateProfileInput = require('../../validation/profile');

//Load Profile model
const Profile = require('../../models/Profile');
//Load User model
const User = require('../../models/User');

//@routes        Get api/profile/test
// @description  Test profile routes
//@access        Public
router.get('/test', (req, res) => res.json({ msg: "Profile Works" }));


//@routes        Get api/profile
// @description   Get current users profile 
//@access        Private

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
}
);


//@routes        GET api/profile/all
// @description  GET  all profile 
//@access        Public

router.get('/all', (req, res) => {
    const errors = {};

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = 'There is no profiles';
                return res.status(404).json(errors);
            }

            res.json(profiles);
        })
        .catch(err => res.status(404).json({ profile: 'There are no profiles' }));
});


//backend api route
//@routes        POST api/profile/handle/:handle
// @description  get profile by handle
//@access        Public

router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});


//@routes        POST api/profile/user/:user_id
// @description  get profile by user ID
//@access        Public

router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json({ profile: 'There is no profile for this user' }));
});




//@routes        POST api/profile
// @description  Create or edit users  profile 
//@access        Private

router.post(
    '/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validateProfileInput(req.body);

        //Check Validate
        if (!isValid) {
            //return any errors with 400 status
            return res.status(400).json(errors);
        }

        //Get fields
        const profileFields = {};
        profileFields.user = req.user.id;
        if (req.body.handle) profileFields.handle = req.body.handle;

        profileFields.social = {};
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.facebook) profileFields.social.facebook = req.body.facebook;

        Profile.findOne({ user: req.user.id }).then(profile => {
            if (profile) {
                //Update
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                ).then(profile => res.json(profile));
            } else {
                //Create

                //Check if handle exist
                Profile.findOne({ handle: profileFields.handle }).then(profile => {
                    if (profile) {
                        errors.handle = 'That handle already exist';
                        res.status(400).json(errors);
                    }

                    //Save profile
                    new Profile(profileFields).save().then(profile => res.json(profile));
                });
            }
        });

    }
);

//@routes        Delete  api/profile
// @description  Delete users and profile 
//@access        Private

router.delete(
    '/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOneAndRemove({ user: req.user.id }).then(() => {
            User.findOneAndRemove({ _id: req.user.id }).then(() =>
                res.json({ success: true })
            )
        })
    }
)

module.exports = router;