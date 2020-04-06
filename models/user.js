var jwt = require('jsonwebtoken');

module.exports = {
  verifyToken: function(token)
  {
    try {
      var decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch(err) {
      // err
      return false;
    }
    
  }
};