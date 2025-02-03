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



const database = require('../../database');
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
        text = await watch_if_can_create_all_the_combo(products);

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

async function watch_if_can_create_all_the_combo(combos) {
    // Iterate through all the combos
    var arrayCombo = await get_all_supplies_of_the_combos(combos)
    var listSupplies = calculate_the_supplies_that_need(arrayCombo);
    
    //we will to calculate if have the supplies need for create all the combos that the customer would like eat
    const answer = await exist_the_supplies_need_for_creat_all_the_combos(listSupplies);
    if (answer == true) {
        //if exist all the supplies, we update the inventory 
        for (const supplies of listSupplies) {
            /*
            if the supplies is equal to a empty space, this means that the products not use inventrory, else if exist a name
            the producuts if use inventory
            */
            if(supplies.name!=''){
                //get the data feature of the supplies and his existence 
                const dataSuppliesFeactures = await get_data_supplies_features(supplies.idBranch, supplies.idSupplies)

                const existence = dataSuppliesFeactures.existence;
                const newAmount = parseFloat(existence) - parseFloat(supplies.amount); //calculate the new amount for update in the inventory
                await update_inventory(supplies.idBranch, supplies.idSupplies, newAmount);
            }
        }
    } else {
        return 'No se puede crear el combo porque no existe suficiente ' + answer;
    }

    // If cannot create the combo, send a message of warning
    return 'success';
}

async function get_all_supplies_of_the_combos(combos) {
    // Iterate through all the combos
    var arrayCombo = []
    for (const combo of combos) {
        const amountCombo = combo.quantity;
        const dataComboFeatures = await get_data_combo_features(combo.id_dishes_and_combos);

        
        if (dataComboFeatures != null) {
            //get the supplies that need this combo for his creation
            const supplies = await get_all_supplies_this_combo(dataComboFeatures, amountCombo);
            arrayCombo.push(supplies)
        }
    }

    return arrayCombo;
}

async function exist_the_supplies_need_for_creat_all_the_combos(listSupplies) {
    //we will to calculate if have the supplies need for create all the combos that the customer would like eat
    for (const supplies of listSupplies) {
        /*
        if the supplies is equal to a empty space, this means that the products not use inventrory, else if exist a name
        the producuts if use inventory
        */
        if(supplies.name!=''){
            if (!await exist_supplies_for_create_this_combo(supplies.idBranch, supplies.idSupplies, supplies.amount)) {
                //if there are not enough supplies, we will send the supplies that need buy the restaurant 
                return supplies.name;
            }
        }
    }

    return true;
}

async function get_data_supplies_features(idBranch, idSupplies) {
    const queryText = `
    SELECT 
        existence,
        minimum_inventory
    FROM "Inventory".product_and_suppiles_features
    WHERE id_branches = $1 and id_products_and_supplies=$2
    `;

    try {
        const result = await database.query(queryText, [idBranch, idSupplies]);
        return result.rows[0];
    } catch (error) {
        console.error('Error get data combo feactures car:', error);
        return false;
    }
}

async function get_data_combo_features(idCombo) {
    const queryText1 = `
    SELECT dc.name, df.id_companies, df.id_branches, df.id_dishes_and_combos
    FROM "Kitchen".dishes_and_combos dc
    INNER JOIN "Inventory".dish_and_combo_features df
    ON dc.id = df.id_dishes_and_combos
    WHERE df.id = $1;
    `;

    const queryText = `
    SELECT dc.name, df.id_companies, df.id_branches, df.id_dishes_and_combos
    FROM "Inventory".dish_and_combo_features df
    INNER JOIN "Kitchen".dishes_and_combos dc
    ON dc.id = df.id_dishes_and_combos
    WHERE df.id_dishes_and_combos = $1;
    `;

    //update the provider data in the database
    try {
        const result = await database.query(queryText, [idCombo]);
        return result.rows[0];
    } catch (error) {
        console.error('Error get data combo feactures car:', error);
        return null;
    }
}

async function get_all_supplies_this_combo(dataComboFeatures, amountCombo) {
    // Get the data of the combo to check if the inventory has the supplies to create the combo
    const idCombo = dataComboFeatures.id_dishes_and_combos;
    const idBranch = dataComboFeatures.id_branches;
    const dataSupplies = await get_all_price_supplies_branch(idCombo, idBranch);

    // first Iterate through all the supplies needed for this combo
    var arraySupplies = []
    for (const supplies of dataSupplies) {
        const name = supplies.product_name;
        const idSupplies = supplies.id_products_and_supplies;
        const amount = supplies.amount * amountCombo;
        arraySupplies.push({ idBranch, name, idSupplies, amount });
    }

    return arraySupplies;
}

async function get_all_price_supplies_branch(idCombo, idBranch) {
    try {
        // Consulta para obtener los suministros de un combo específico
        const comboQuery = `
            SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, psf.currency_sale
            FROM "Kitchen".table_supplies_combo tsc
            INNER JOIN "Inventory".product_and_suppiles_features psf
            ON tsc.id_products_and_supplies = psf.id_products_and_supplies
            WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
        `;
        const comboValues = [idCombo];
        const comboResult = await database.query(comboQuery, comboValues);
        
        // Consulta para obtener el precio de los suministros en la sucursal específica
        const priceQuery = `
            SELECT psf.id_products_and_supplies, psf.sale_price, psf.sale_unity
            FROM "Inventory".product_and_suppiles_features psf
            WHERE psf.id_branches = $1 ORDER BY id_products_and_supplies DESC
        `;
        const priceValues = [idBranch];
        const priceResult = await database.query(priceQuery, priceValues);

        // Construir un objeto que contenga los suministros y sus precios en la sucursal específica
        const suppliesWithPrice = {};
        priceResult.rows.forEach(row => {
            suppliesWithPrice[row.id_products_and_supplies] = row.sale_price;
        });

        // Agregar los suministros y sus cantidades del combo junto con sus precios
        const suppliesInfo = [];
        comboResult.rows.forEach(row => {
            const supplyId = row.id_products_and_supplies;
            const supplyPrice = suppliesWithPrice[supplyId] || 0; // Precio predeterminado si no se encuentra
            suppliesInfo.push({
                img: '',
                product_name: '',
                product_barcode: '',
                description: '',
                id_products_and_supplies: supplyId,
                amount: row.amount,
                unity: row.unity,
                sale_price: supplyPrice,
                currency: row.currency_sale
            });
        });

        //agregamos los datos del combo 
        const suppliesCombo = await search_supplies_combo(idCombo);
        for (var i = 0; i < suppliesCombo.length; i++) {
            suppliesInfo[i].img = suppliesCombo[i].img;
            suppliesInfo[i].product_name = suppliesCombo[i].product_name;
            suppliesInfo[i].product_barcode = suppliesCombo[i].product_barcode;
            suppliesInfo[i].description = suppliesCombo[i].description;
        }

        return suppliesInfo;
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;
    }
}


function calculate_the_supplies_that_need(arrayCombo) {
    var listSupplies = [] //this list is for save all the supplies for that do not repeat
    
    //we will to read all the combos of the array 
    for (const combo of arrayCombo) {
        //this for read all the supplies of the combo current
        for (const suppliesCombo of combo) {
            //we will see if exist this supplies in our list of supplies not repeat 
            var thisSuppliesExistInMyList = false;
            for (const supplies of listSupplies) {
                //if the supplies exist in our list, we will increase the amount of supplies we will use
                if (supplies.idSupplies == suppliesCombo.idSupplies) {
                    thisSuppliesExistInMyList = true;

                    //we will to calculate the new amount of the supplies 
                    const newAmount = supplies.amount + suppliesCombo.amount;
                    supplies.amount = newAmount;
                    break;
                }
            }

            //if the supplies not exist we will add to the list 
            if (!thisSuppliesExistInMyList) {
                listSupplies.push(suppliesCombo);
            }
        }
    }
    return listSupplies;
}

async function update_inventory(idBranch, idCombo, newAmount) {
    const queryText = `
    UPDATE "Inventory".product_and_suppiles_features
    SET 
        existence=$1
    WHERE 
        id_branches=$2 and id_products_and_supplies=$3
    `;

    //create the array of the new data supplies
    var values = [newAmount, idBranch, idCombo];

    //update the provider data in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating provider:', error);
        return false;
    }
}

async function search_supplies_combo(id_dishes_and_combos) {
    var queryText = `
        SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
        FROM "Kitchen".table_supplies_combo tsc
        JOIN "Kitchen".products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
        WHERE tsc.id_dishes_and_combos = $1 AND pas.use_inventory = True
        ORDER BY id_products_and_supplies DESC
    `;
    var values = [id_dishes_and_combos];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function exist_supplies_for_create_this_combo(idBranch, idSupplies, amount) {
    try {
        //we going to get the data that need for calculate if we can create the combo
        const dataSuppliesFeactures = await get_data_supplies_features(idBranch, idSupplies)
        const existence = dataSuppliesFeactures.existence;
        const minimumInventory = dataSuppliesFeactures.minimum_inventory;
        
        //we will calculate if can create the combo
        return (existence - amount >= 0);
    } catch (error) {
        return false;
    }
}



module.exports = router;