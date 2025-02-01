//*-----character app---//
//this is for create the router of the app
const express = require('express');
const router = express.Router();

//this is for get all the apps of the ERP
const apps=require('../../lib/app.js'); 

//this is for get the name of the folder for show his views
const path = require('path');
const nameApp=path.basename(__dirname); //get the name of the folder
const pathFile=`../apps/${nameApp}`

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
const{
    search_providers,
    search_all_providers,
    search_providers_for_name,
    search_all_providers_for_name,
    search_provider,
    delete_provider
}= require('./services/providers.js');

const rolFree=0;

//*-----------------------------------------------------------routes-----------------------------------------//
router.get('/:id_company/:id_branch/providers', isLoggedIn, async (req, res) => {
    //if this company is of the user, we will to search all the providers of tha company
    const { id_company , id_branch} = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_provider')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const providers = await search_providers(id_branch);
    const branchFree = await get_data_branch(id_branch);
    const myApps=apps.get_all_my_apps(req.user);

    res.render(`${pathFile}/views/providers`,{branchFree, myApps, providers});
})

router.get('/:id_company/:name_provider/search-provider', isLoggedIn, async (req, res) => {
    const{id_company,id_branch}=req.body;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_provider')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    //we will see if the company is of the user 
    const company = await this_company_is_of_this_user(req, res)
    if (company != null) {
        //if this company is of the user, we will to search all the providers of tha company
        const { id_company, name_provider } = req.params;
        const providers = await search_all_providers_for_name(id_company, name_provider);
        //if the company not have providers render other view
        if (providers.length == 0) {
            res.render('links/manager/providers/providers', { company });
        }
        else {
            res.render('links/manager/providers/providers', { company, providers });
        }
    }
})

router.get('/:id_company/add-providers', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const branches = await search_all_branch(id_company)
    res.render('links/manager/providers/addProviders', { company, branches });
})

router.get('/:id_provider/edit-providers', isLoggedIn, async (req, res) => {
    //if this company is of the user, we will to search the provider of tha company
    const { id_provider } = req.params;
    const provider = await search_provider(id_provider);
    if(req.user.rol_user==rolFree){
        const branchFree=await get_data_branch(id_branch);
        res.render('links/manager/providers/editProviders', { provider, branchFree });
    }else{
        const branch=await get_data_branch(id_branch);
        res.render('links/manager/providers/editProviders', { provider, branch });
    }
})

router.get('/:id_company/:id_branch/:id_provider/edit-prover', isLoggedIn, async (req, res) => {
    //if this company is of the user, we will to search the provider of tha company
    const { id_company, id_branch, id_provider } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'edit_provider')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const provider = await search_provider(id_provider);
    if(req.user.rol_user==rolFree){
        const branchFree=await get_data_branch(id_branch);
        res.render('links/manager/providers/editProviders', { provider, branchFree });
    }else{
        const branch=await get_data_branch(id_branch);
        res.render('links/manager/providers/editProviders', { provider, branch });
    }
})

router.get('/:id_company/:id_branch/:id_provider/delete-provider', isLoggedIn, async (req, res) => {
    //we will see if the company is of the user 
    const { id_provider, id_company, id_branch} = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'delete_provider')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    if (await delete_provider(id_provider)) {
        req.flash('success', 'El proveedor fue eliminado con éxito 😉')
    }
    else {
        req.flash('message', 'El proveedor no fue eliminado 😮')
    }

    //we will see if the user have a subscription in ed one 
    if(req.user.rol_user==rolFree){
        res.redirect(`/fud/${id_company}/${id_branch}/providers-free`);
    }else{
        res.redirect(`/fud/${id_company}/${id_branch}/providers`);
    }
})


//-----banch Free
router.get('/:id_company/:id_branch/add-providers', isLoggedIn, async (req, res) => {
    
    const { id_company, id_branch} = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'add_provider')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const myApps=apps.get_all_my_apps(req.user);
    get_all_the_products_of_the_store
    //we will see if the user is use ed one
    const branchFree = await get_data_branch(id_branch);
    res.render(`${pathFile}/views/addProviders`, { branchFree, myApps});
})




module.exports = router;