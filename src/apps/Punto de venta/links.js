//get the need for create the path
const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
const apps=require('../../lib/app.js');

router.get('/home-app-2', (req, res) => {
    const myApps=apps.get_all_my_apps();
    res.render('links/home',{myApps});
})






module.exports = router;