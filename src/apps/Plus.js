
function show_view(pathView,data){
    res.render('/web/main');
}



module.exports = { 
    show_view
};

/*
const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const helpers=require('../lib/helpers.js');




module.exports = { 
    router, 
    isLoggedIn, 
    isNotLoggedIn, 
    helpers 
};
*/