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




router.post('/car-post', isLoggedIn, async (req, res) => {
    var commander = ''
    var text = ''

    const idCompany=req.user.id_company;
    const idEmployee=req.user.id_employee;
    const idBranch=req.user.id_branch;
    
    try {
        //get the data of the server
        const products = req.body.products;
        
        //we will seeing if can create all the combo of the car
        text = 'success' //await watch_if_can_create_all_the_combo(combos);

        //if can buy this combos, we going to add this buy to the database 
        if (text == 'success') {
            const { id_customer } = req.params;

            //get the day of sale
            const day = new Date();

            const commanderDish=[]
            for (const product of products) {
                console.log(product)
                const nameProduct=product.name;
                const priceProduct=product.name;
                const amount=product.quantity;
                const totalPrice=product.price*product.quantity;
                commanderDish.push({
                    nameProduct, 
                    priceProduct, 
                    amount, 
                    totalPrice 
                });

                //save the buy in the database 
                await point_sales.add_buy_history(idCompany, idBranch, idEmployee, id_customer, product.id_dishes_and_combos,product.price,product.quantity,totalPrice,day);
            }

            //save the comander
            commander=create_commander(idBranch, idEmployee, id_customer, commanderDish, req.body.total, req.body.moneyReceived, req.body.change, req.body.comment, day);
            text=await point_sales.add_commanders(commander); //save the id commander
        }

        //send an answer to the customer
        res.status(200).json({ message: text});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
})


function create_commander(id_branch, id_employee, id_customer, commanderDish, total, moneyReceived, change, comment, date) {
    const commander = {
        id_branch,
        id_employee,
        id_customer: id_customer === 'null' ? null : id_customer,
        commanderDish: JSON.stringify(commanderDish),
        total,
        moneyReceived,
        change,
        status: 0,
        comment,
        date
    }
    return commander;
}


module.exports = router;