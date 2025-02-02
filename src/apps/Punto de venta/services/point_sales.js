const database = require('../../../database');

async function get_all_the_products_of_the_store(id_branch){
    var queryText = `
        SELECT 
            i.*,
            d.barcode,
            d.name,
            d.description,
            d.img,
            d.id_product_department,
            d.id_product_category,
            d.this_product_is_sold_in_bulk
        FROM "Inventory".dish_and_combo_features i
        INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
        WHERE i.id_branches = $1
    `;
    var values = [id_branch];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function add_commanders(data) {
    var queryText = 'INSERT INTO "Branch".commanders(id_branches, id_employees, id_customers, order_details, total, money_received, change, status, comentary, commander_date)' +
                    ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id';
    var values = Object.values(data);
    try {
        const result = await database.query(queryText, values);
        return result.rows[0].id; // return the ID that save in the database
    } catch (error) {
        console.error('Error to add in the database commanders:', error);
        return false;
    }
}

async function add_buy_history(id_companies, id_branches, id_employees, id_customers,id_dishes_and_combos,price,amount,total,day){
    let idCustomer = parseInt(id_customers);
    if (isNaN(idCustomer)) {
        idCustomer = null;
    }
    
    var queryText = 'INSERT INTO "Box".sales_history (id_companies, id_branches, id_employees, id_customers, id_dishes_and_combos, price, amount, total, sale_day)'
        +'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    var values = [id_companies, id_branches, id_employees, idCustomer,id_dishes_and_combos,price,amount,total,day] 
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error add database history:', error);
        return false;
    }
}

module.exports = {
    get_all_the_products_of_the_store,
    add_commanders,
    add_buy_history
};