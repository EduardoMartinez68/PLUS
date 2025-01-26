const express=require('express');
const router=express.Router();
const system=require('../lib/system');

router.get('/',(req,res)=>{
    //we will see if the user have the app desktop 
    res.render('links/login/login');
})

module.exports=router;