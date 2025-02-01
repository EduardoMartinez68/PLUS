//this is for create the router of the app
const express = require('express');
const router = express.Router();

//this is for get all the apps of the ERP
const apps=require('../../lib/app.js'); 

//this is for get the name of the folder for show his views
const path = require('path');
const nameApp=path.basename(__dirname); //get the name of the folder

//*-----my permission---//
const {
    this_user_have_this_permission
} = require('../../lib/permission.js');
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth.js');

//*-----function of branch---//
const{
    get_data_branch
}=require('../../services/branch.js');

//*-----my scripts---//
const point_sales= require('./services/point_sales.js');

//*-----------------------------------------------------------routes-----------------------------------------//
router.get('/:id_company/:id_branch/point-sales', async (req, res) => {
    const { id_company, id_branch} = req.params;
    const myApps=apps.get_all_my_apps(req.user);

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'app_point_sales')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const products=await point_sales.get_all_the_products_of_the_store(id_branch);
    console.log(products)
    res.render(`../apps/${nameApp}/views/main`,{myApps,products});
})





module.exports = router;