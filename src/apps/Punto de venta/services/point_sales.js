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


module.exports = {
    get_all_the_products_of_the_store
};