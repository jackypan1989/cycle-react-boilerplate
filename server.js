var express = require('express');
var app = express();
var consolidate = require('consolidate');
var port = process.env.PORT || 3000;

app.engine('html', consolidate['swig']);
app.set('view engine', 'html');
app.set('views', './server/views');
app.get('*', function (req, res) {
  res.render('index');
});

var server = app.listen(port, function () {
  console.log('App server started at port ' + port);
});