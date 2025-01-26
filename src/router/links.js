const express = require('express');
const router = express.Router();
const database = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const helpers=require('../lib/helpers.js');
const apps=require('../lib/app.js');

//*-----------------------------------------------------------routes of the web-----------------------------------------//
router.get('/login-desktop', (req, res) => {
    res.render('links/login/login');
})

router.get('/restart-password', (req, res) => {
    res.render('links/login/restartPasswordEmail');
})

router.get('/restart-password2', (req, res) => {
    res.render('links/login/restartPassword');
})

router.get('/:id_company/:id_branch/permission_denied', (req, res) => {
    const myApps=apps.get_all_my_apps(req.user);
    res.render('links/permission_denied',{myApps});
})

router.get('/home', (req, res) => {
    const myApps=apps.get_all_my_apps(req.user);
    console.log(req.user)
    res.render('links/home',{myApps});
})

//*-----------------------------------------------------------routes of the apps-----------------------------------------//
//her we will show the container of the app
router.get('/app/:id_app', (req, res) => {
    const {id_app}=req.params;
    const myApps=apps.get_all_my_apps(req.user);

    //we will search the data of the app in the array
    const appData = myApps.find(app => app.appName === id_app);
    
    if (appData){ // we will see if exist the app in the array
        //we will see if the user have the permission for show the app
        const idCompany=req.user['id_company'];
        const idBranch=req.user['id_branch'];
        
        //redirect to the user to the home of the app
        res.redirect(`/links/${idCompany}/${idBranch}/providers`);
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