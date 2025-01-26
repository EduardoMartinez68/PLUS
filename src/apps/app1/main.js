//character of the app
const appName='App'
const permissions={
    'see':"app_point_sales",
    'add':"addUser",
    'edit':"editUser",
    'delete':"deleteUser"
}

const link='products'

//link of the web:path view in the folder views
const linksIsLoggedIn={
    'home': 'table',
}

//this is for get the path where the app is run
const path = require('path');
const pathApp= __dirname;

const icon = 'products.webp'

//this is because if the programmer need this data
module.exports = { 
    appName, 
    link,
    permissions, 
    pathApp,
    icon
};
