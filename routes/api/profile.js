const express = require('express');
const router = express.Router();


//@routes        Get api/profile/test
// @description  Test profile routes
//@access        Public
router.get('/test', (req, res) => res.json({ msg: "Profile Works" }));

module.exports = router;