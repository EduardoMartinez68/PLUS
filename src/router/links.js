const express = require('express');
const router = express.Router();
const database = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const helpers=require('../lib/helpers.js');
const apps=require('../lib/app.js');

router.get('/home', (req, res) => {
    const myApps=apps.get_all_my_apps();
    res.render('links/home',{myApps});
})

//her we will show the container of the app
router.get('/app/:id_app', (req, res) => {
    const {id_app}=req.params;
    const myApps=apps.get_all_my_apps();

    //we will search the data of the app in the array
    const appData = myApps.find(app => app.appName === id_app);

    if (appData) { // we will see if exist the app in the array
        //we will see if the user have the permission for show the app
        return res.render('links/home',{myApps});
    } else {
        //if not exist the app we will show a message of error
        req.flash('message','La app que intentas acceder no existe en tu base de datos. 😅')
        res.redirect('links/home');
    }
})

router.get('/:id_app/:link', (req, res) => {
    const {id_app,link}=req.params;

    const myApps=apps.get_all_my_apps();
    res.render('links/home',{myApps});
})

module.exports = router;