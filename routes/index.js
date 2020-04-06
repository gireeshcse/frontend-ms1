var express = require('express');
var router = express.Router();
var User = require('../models/user');
var os = require('os');
var cookie = require('cookie');
var auth = {flag:false,data:null};
const csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

const axios = require('axios');

var info = { 
  hostname: os.hostname(),
  networkInterfaces: os.networkInterfaces(),
  uptime:os.uptime(),
  cpus:os.cpus(),
  user_ip: ''
};

router.use(function(req,res,next){
  info.user_ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  (req.connection.socket ? req.connection.socket.remoteAddress : null);
  next();
});

router.use(function(req,res,next){
  if(req.cookies.name !== undefined)
  {
    var decoded = User.verifyToken(req.cookies.name);
    if(decoded !== false)
    {
      auth.flag = true;
      auth.data = decoded;
    }
  }else{
    //if this is not set the data of previous values are retained 
    auth.flag = false;
    auth.data = null;
  }
  console.log('Auth Data');
  console.log(auth);
  next();
});
/* GET home page. */
router.get('/', function(req, res, next) {
   // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)
 
  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies)
  res.render('pages/index', { title: 'Casbin Demo App' , info : info, auth_data:auth.data });
});

router.get('/login', function(req, res, next) {
  if(auth.flag)
  {
      res.statusCode = 302;
      console.log(req.headers.referer);
      if(req.headers.referer.endsWith('/login'))
      req.headers.referer = '/';
      res.setHeader('Location', req.headers.referer || '/');
      res.end();
      return;
  }
  //req.csrfToken()
  res.render('pages/login', { title: 'Casbin Demo App::Login App',token : ''});
});

router.post('/login', async function(req, res, next) {

  axios.post(process.env.API_ENDPOINT+'/authenticate',req.body)
  .then(function(response){
      if(response.data.token !== undefined)
      {
        res.setHeader('Set-Cookie', cookie.serialize('name', String(response.data.token), {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7 // 1 week
        }));
    
        // Redirect back after setting cookie
        res.statusCode = 302;
        res.setHeader('Location', req.headers.referer || '/');
        res.end();
        return;
      }else{
        res.render('pages/login', { title: 'Casbin Demo App::Login App',token :'',error:JSON.stringify(response.data) });
      }
      
  })
  .catch(function(error){
    console.log('error in auth');
    console.log(error);
    res.render('pages/login', { title: 'Casbin Demo App::Login App',token :'',error:JSON.stringify(error) });
  });
});

router.get('/register',csrfProtection, function(req, res, next) {
  res.render('pages/register', { title: 'Casbin Demo App::Register',token :req.csrfToken() });
});
//,csrfProtection
router.post('/register', function(req, res, next) {
  req.body.username = req.body.email;
  axios.post(process.env.API_ENDPOINT+'/users', req.body)
  .then(function (response) {
    console.log(response);
    res.render('pages/success',{data:JSON.stringify(response.data), title: 'Casbin Demo App::Register Success'});
  })
  .catch(function (error) {
    console.log(error);
    res.render('pages/register', { 
      title: 'Casbin Demo App::Register Error',
      token :req.csrfToken(),
      error:JSON.stringify(error) 
    });
  });

});

router.get('/logout',function(req,res,next){
      res.clearCookie("name");
      res.statusCode = 302;
      res.setHeader('Location', req.headers.referer || '/');
      res.end();
      return;
});


module.exports = router;
