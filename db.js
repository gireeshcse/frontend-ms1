var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_CONNECTION_URL,
   {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     autoIndex: process.env.MONGODB_AUTO_INDEX
    }
);

var db = mongoose.connection;


db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  // we're connected!
  console.log("Database Connected");
});


module.exports = db;
