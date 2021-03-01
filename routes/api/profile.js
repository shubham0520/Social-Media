const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/profile");
const User = require("../../models//userModel");
const { check, validationResult } = require("express-validator");

//@routr   api/profile/me
//@desc    get current user profile
//@access  Public
router.get('/me', auth, async (req, res) => {
    try {

        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(404).json({ msg: 'there is no profile for this user' });
        }
    } catch (err) {
        res.status(500).send('server error')
    }
})
//@routr   api/profile/
//@desc    create or update user profile
//@access  Private

router.post('/', [auth, [
    check('status', 'Status is required')
        .not().isEmpty(),
    check('skills', 'Skill is required').not().isEmpty()
]], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;
    // build profile object
    const profileFields = {}
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    // build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (profile) {
            //update
            profile = await Profile.findOneAndUpdate({ user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }
        // create
        profile = new Profile(profileFields);
        await profile.save();
        console.log(profile)
        res.json(profile);

    } catch (err) {
        console.error(err.message)
        res.status(500).send('server Error');
    }

})
//@routr   api/profile/
//@desc    get profile data
//@access  Private

router.get('/', async (req, res) => {
    try {
        console.log('*************** Check before ******************', Profile)
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        console.log('*************** Check after ******************')
        res.json(profiles)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server Error');
    }
})
module.exports = router;