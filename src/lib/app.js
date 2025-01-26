//get tha current route
const path = require('path');
const fs = require('fs');
const appsDir = path.join(__dirname, '../apps');

//this is for get the path folders of the apps
function get_the_address_of_the_application_folders() {
    return fs.readdirSync(appsDir, { withFileTypes: true }) // Leer el contenido de la carpeta
        .filter(item => item.isDirectory()) // Filtrar solo directorios
        .map(item => item.name); // Devolver solo los nombres de las carpetas
}

function get_data_of_the_app(app_name){
    //this is for create the path complate of the app
    const appPath = path.join(appsDir, app_name, 'main.js');

    //we will see if the file exist in the app
    if (fs.existsSync(appPath)) {
        //Dynamically import the file and return its data
        return require(appPath);
    } else {
        return null;
    }
}


function get_all_my_apps(user){
    //we will see if the programmer send the user for avoid a error
    if(!user){
        return [];
    }

    let allMyApps=[]; //her we will save all the data of the apps for after print in screen
    const pathApp=get_the_address_of_the_application_folders(); //get all the folders in the apps folder

    for (const appName of pathApp) {
        const appData = get_data_of_the_app(appName); // get all the data of the app
        const permissions=appData.permissions['see'];
        //we will see if the user have the permission for see this app 
        if(user[permissions]){
            allMyApps.push(appData); // add the data to the array
        }
    }

    return allMyApps;
}

module.exports={
    get_the_address_of_the_application_folders,
    get_data_of_the_app,
    get_all_my_apps
}