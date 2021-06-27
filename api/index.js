"use strict";

var mongoose = require("mongoose");
var app = require('./app');
var port = 3800;

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);

// conect to database
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/mean_social_network")
  .then(() => {
    console.log("connection is successfully");

    // create server
    app.listen(port, () => {
        console.log('server is running in http://localhost:'+ port);
    })
  })
  .catch((err) => console.log(err));
