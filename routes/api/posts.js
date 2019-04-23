const express = require('express');
const router = express.Router();


//@routes        Get api/posts/test
// @description  Test post routes
//@access        Public
router.get('/test', (req, res) => res.json({ msg: " Posts Works" }));

module.exports = router;