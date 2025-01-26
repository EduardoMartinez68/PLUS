const express=require('express');
const router=express.Router();
const system=require('../lib/system');

router.get('/',(req,res)=>{
    //we will see if the user have the app desktop 
    if(system=='desktop'){
        res.redirect('/links/home');
    }
    else{
        res.render('links/web/prices');
    }
})

module.exports=router;