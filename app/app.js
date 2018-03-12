var express = require('express');
var reload = require('reload');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var configFile = require('../config.json');

var app = express();
app.use(cookieParser())
app.set('port', process.env.PORT || 3000);
app.set('appConfig', configFile)
app.use(express.static('app/public'));
app.use(require('./routes/create-account-route'));
app.use(require('./routes/sign-in-route'));
app.use(require('./routes/play-route'));
app.set('view engine', 'ejs');
app.set('views', 'app/views');

mongoose.connect(configFile.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('MongoDB connected')
});



var server = app.listen(app.get('port'), function(){
    console.log("listening on port " + app.get('port'));
});

reload(app);
