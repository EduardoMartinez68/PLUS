//this is for create the router of the app
const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

//this is for get all the apps of the ERP
const apps=require('../../lib/app.js'); 

//this is for get the name of the folder for show his views
const path = require('path');
const nameApp=path.basename(__dirname); //get the name of the folder




//*-----------------------------------------------------------routes-----------------------------------------//
router.get('/home-app2', (req, res) => {
    const myApps=apps.get_all_my_apps(req.user);

    res.render(`../apps/${nameApp}/views/table`,{myApps});
})





module.exports = router;