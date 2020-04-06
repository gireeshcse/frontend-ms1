var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

var userSchema = new Schema({
    username:  {type: String,lowercase:true,trim:true,required:true,unique:true}, // String is shorthand for {type: String}
    firstname: String,
    lastname: String,
    email: {type: String,lowercase:true,trim:true,required:true,unique:true},
    password:{type: String,required:true},
    lastLogin: [{ info: String, date: Date }],
    createdAt: { type: Date, default: Date.now },
    active: Boolean
  });

//Indexes
// schema level username ascending order & email descending order
userSchema.index({ username: 1, email: -1 }); 

userSchema.methods.savedInfo = function () {
  var message = 'Account Created with username '+this.username + " Whose ID is " + this._id;
  console.log(message);
}

userSchema.virtual('fullName').get(function () {
  if(this.lastname === undefined)
    this.lastname = '';
  return this.firstname + ' ' + this.lastname;
}).
set(function(v) {
  this.firstname = v.substr(0, v.indexOf(' '));
  this.lastname = v.substr(v.indexOf(' ') + 1);
});

userSchema.statics.findByUsername = function(username){
  return this.find({username : new RegExp(username,'i')});
}

userSchema.statics.findByEmail = async function(email){
  return await this.findOne({email : email});
}

userSchema.methods.verifyPassword = function(password){
  if(bcrypt.compareSync(password, this.password)) {
    // Passwords match
    return true;
   } else {
    // Passwords don't match
    return false;
   }
}

userSchema.methods.generateToken = function(){
  return jwt.sign({ email: this.email,id:this._id,name:this.fullName }, process.env.JWT_SECRET);
}

userSchema.statics.verifyToken = function(token)
{
  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch(err) {
    // err
    return false;
  }
  
}

userSchema.static('generatePassword',function(password){
  return bcrypt.hashSync(password, 10);
});

// userSchema.pre('save', function(next) {
//   // do stuff
//   console.log('New Record Error');
//   console.log(this);
//   throw new Error({error:'New Record Error',others:this});
//   // next();
// });

userSchema.static('findUsersByGroup',function(active){
  return this.find({active:active});
});

var User = mongoose.model('User', userSchema);

module.exports = User;