//character of the app
const appName='Punto de venta'
const permissions={
    'see':"app_point_sales",
    'add':"addUser",
    'edit':"editUser",
    'delete':"deleteUser"
}

const link='point-sales'

//link of the web:path view in the folder views
const linksIsLoggedIn={
    'home': 'table',
}

//this is for get the path where the app is run
const path = require('path');
const pathApp= __dirname;

const icon = 'point_sales.webp'

//this is because if the programmer need this data
module.exports = { 
    appName, 
    link,
    permissions, 
    pathApp,
    icon
};
