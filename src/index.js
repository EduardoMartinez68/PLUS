const system=require('./lib/system');

//----------------------desktop application
//const { app, BrowserWindow } = require('electron');


//----------------------server application
const express=require('express');
const morgan=require('morgan');
const {engine}=require('express-handlebars');
const multer=require('multer');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const { database } = require('./keys');

const { v4: uuid } = require('uuid');
const path=require('path');

//ReCAPTCHA of Google
const { RecaptchaV2 } = require('express-recaptcha');



//*------------------initializations-----------------------------------------//
const serverExpress =express();
require('./lib/passport');

//*-----------------------------------------------------------settings-----------------------------------------//
serverExpress.set('port',process.env.PORT || 4000);
serverExpress.set('views',path.join(__dirname,'views'))
serverExpress.engine('.hbs',engine({ //we will create the engine for the web
    defaultLayout:'main',
    layoutsDir: path.join(serverExpress.get('views'),'layouts'),
    partialsDir: path.join(serverExpress.get('views'),'partials'),
    extname: '.hbs',
    helpers:require('./lib/handlebars')
}))
serverExpress.set('view engine','.hbs');


//*-----------------------------------------------------------middlewares-----------------------------------------//
require('dotenv').config();
const {APP_PG_USER,APP_PG_HOST,APP_PG_DATABASE,APP_PG_PASSWORD,APP_PG_PORT}=process.env; //this code is for get the data of the database

const pg = require('pg');
const pgPool = new pg.Pool({
    user: APP_PG_USER,
    host: APP_PG_HOST,
    database: APP_PG_DATABASE,
    password: APP_PG_PASSWORD,
    port: APP_PG_PORT,
    /*
    ssl: {
        rejectUnauthorized: false,
    }*/
    
});


serverExpress.use(session({
    secret: 'FudSession',
    resave: false ,
    saveUninitialized:false,
    store: new (require('connect-pg-simple')(session))({
        pool : pgPool,
        tableName : 'session'  
      }),
    //store: new MySQLStore(pool)
}));

//*-----------------------------------------------------------activate the our library-----------------------------------------// 
serverExpress.use(flash());
serverExpress.use(morgan('dev'));
serverExpress.use(express.urlencoded({extended:false}));
serverExpress.use(express.json());
serverExpress.use(passport.initialize());
serverExpress.use(passport.session());

const storage=multer.diskStorage({ //this function is for load a image in the forms
    destination: path.join(__dirname,'public/img/uploads'),
    filename: (req,file,cb,filename)=>{
        cb(null,uuid()+path.extname(file.originalname));
    }
});

serverExpress.use(multer({storage: storage}).single('image'));


//*-----------------------------------------------------------global variables-----------------------------------------//
serverExpress.use((req,res,next)=>{
    serverExpress.locals.success=req.flash('success');
    serverExpress.locals.message=req.flash('message');
    serverExpress.locals.user=req.user;
    serverExpress.locals.company=req.company;
    serverExpress.locals.pack_company = 0;
    serverExpress.locals.pack_branch = 0;
    next();
});


//*-----------------------------------------------------------routes-----------------------------------------//
serverExpress.use(require('./router'))
serverExpress.use(require('./router/authentication'))
serverExpress.use('/links',require('./router/links'))

//we will get all the folders of the apps and we will add the routers of the files links
const apps=require('./lib/app.js');
const myApps=apps.get_the_address_of_the_application_folders(); //get all the folder in the apps folder

//we use a loop for get all the routers of the apps
for (const app of myApps) {
    serverExpress.use('/links',require(`./apps/${app}/links`)); //get the files links.js of the apps
}

//public
serverExpress.use(express.static(path.join(__dirname,'public')));

//*-----------------------------------------------------------Server application-----------------------------------------//
/*
    SETTING IN PACKAGE.JSON
  "main": "index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/"
  },
*/

//this is for get the IP of the computer that is the server
const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let iface in interfaces) {
        for (let i = 0; i < interfaces[iface].length; i++) {
            const address = interfaces[iface][i];
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
    return '127.0.0.1';
}

//starting the server in the computer
serverExpress.listen(serverExpress.get('port'), '0.0.0.0', () => {
    console.log(`Server running on http://${getLocalIP()}:${serverExpress.get('port')}`);
});


//*-----------------------------------------------------------Desktop application-----------------------------------------//
/*
//we will see if the APP is for desktop
    SETTING IN PACKAGE.JSON
  "main": "src/index.js",
  "scripts": {
    "start": "npx electron .",
    "dev": "nodemon src/",
    "electron": "electron ."
  },

//this is for create the UI in the windows
let mainWindow;
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    //This is to make the screen grow to full screen
    mainWindow.maximize();

    // load the URL of the server Express
    mainWindow.loadURL(`http://localhost:${serverExpress.get('port')}`);
};

// whne Electron is ready, load the web in the screen
app.on('ready', createMainWindow);

// clouse the screen
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
*/