var express = require('express');
var router = express.Router();
var User = require('../models/user');
var cookie = require('cookie');
var enforcer = require('../auth/enforcer');

router.use(function(req,res,next){
    if(req.cookies.name !== undefined)
    {
      var decoded = User.verifyToken(req.cookies.name);
      if(decoded !== false)
      {
          req.auth = {
              flag:true,
              data:decoded
          }
      }
    }else{
      //if this is not set the data of previous values are retained 
      // Redirect back after setting cookie
      res.statusCode = 302;
      res.setHeader('Location', '/login');
      res.end();
      return;
    }
    next();
});

// View Profile
router.get('/',async function(req,res,next){
    var access = await enforcer.checkAuthorization('*','profile','read');
    console.log(access);
    if(access)
    {
        var user = await User.findOne({email:req.auth.data.email});
        res.render('user/profile',{title: 'Profile Page',user:user,auth_data:req.auth.data});
    }else{
        res.render('user/denied',{title: 'Access Denied Page',auth_data:req.auth.data});
    }
});

// View all Users List
router.get('/users',async function(req,res,next){
    var access = await enforcer.checkAccess(req.auth.data.email,'users','read');
    console.log(access);
    if(access)
    {
        var users = await User.find({});
        res.render('user/users',{title: 'Users Page',users:users,auth_data:req.auth.data});
    }else{
        res.render('user/denied',{title: 'Access Denied Page',auth_data:req.auth.data});
    }
});

// View Profile
router.get('/edit',async function(req,res,next){

    var user = await User.findOne({email:req.auth.data.email});
    if(user)
    {
        var obj = {resource:'profile',owner:user.email};
        var access = await enforcer.editProfile(req.auth.data.email,obj,'edit');
        console.log(access);
        if(access)
        {
            res.render('user/edit',{title: 'Edit Profile Page',user:user,auth_data:req.auth.data});
        }else{
            res.render('user/denied',{title: 'Access Denied Page',auth_data:req.auth.data});
        }
    }

    
});

module.exports = router;