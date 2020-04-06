// import { newEnforcer } from 'casbin';
var newEnforcer = require('casbin').newEnforcer;
var newModel = require('casbin').newModel;
var FileAdapter = require('casbin').FileAdapter;

// Models cannot be saved from database where as 
// policies can be saved database as well as files

var checkAuthorization = async function(sub, obj, act){
    const e =  await newEnforcer(__dirname+'/models/model.conf',__dirname+'/policies/policy.csv');
    if ((await e.enforce(sub, obj, act)) === true) {
        // permit alice to read data1
        return true;
    } else {
        // deny the request, show an error
        return false;
    }
};

var checkAccess = async function(sub, obj, act){
    // Loading model from code
    var model = newModel();
    model.addDef("r","r","sub, obj, act");
    model.addDef("p","p","sub, obj, act");
    model.addDef("g","g","_, _");
    model.addDef("e", "e", "some(where (p.eft == allow))");
    model.addDef("m", "m", "g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act");

    var policy = new FileAdapter(__dirname+'/policies/policy.csv');

    const e = await newEnforcer(model,policy);
    if ((await e.enforce(sub, obj, act)) === true) {
        return true;
    } else {
        return false;
    }
};

var editProfile = async function (sub,obj,act){
    var model = newModel();
    model.addDef("r","r","sub, obj, act");
    model.addDef("p","p","sub, obj, act");

    model.addDef("e", "e", "some(where (p.eft == allow))");
    model.addDef("m", "m", "r.obj.owner == r.sub && r.obj.resource == p.obj && r.act == p.act");
    var policy = new FileAdapter(__dirname+'/policies/profile_policy.csv');

    const e = await newEnforcer(model,policy);
    if ((await e.enforce(sub, obj, act)) === true) {
        return true;
    } else {
        return false;
    }
};

module.exports = {checkAuthorization, checkAccess, editProfile};