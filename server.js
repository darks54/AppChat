var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var md5 = require('MD5');
var fs = require('fs');
var dns = require('dns');
var os = require('os');
var mu = require('mu2');

/**
* Serveur http
**/
app.get('/', function (req, res) {
  // res.sendFile(__dirname + '/views/index.html');
  dns.lookup(os.hostname(), function (err, add, fam) {
    var stream = mu.compileAndRender(__dirname + '/views/index.html', {lien: add + ':8080/'});
    stream.pipe(res);
  });
});

app.get('/message', function (req, res) {
  res.sendFile(__dirname + '/views/message.html');
});

app.get('/qrcode', function (req, res) {
  dns.lookup(os.hostname(), function (err, add, fam) {
    var stream = mu.compileAndRender(__dirname + '/views/qrcode.html', {lien: add + ':8080/'});
    stream.pipe(res);
  });
});

app.get('/js/qrcode.min.js', function (req, res) {
  fs.readFile(__dirname + '/js/qrcode.min.js', function (err, file){sendJavascript(err, file, res)});
});

app.get('/js/qrcode.js', function (req, res) {
  fs.readFile(__dirname + '/js/qrcode.js', function (err, file){sendJavascript(err, file, res)});
});

app.get('/js/mustache.js', function (req, res) {
  fs.readFile(__dirname + '/js/mustache.js', function (err, file){sendJavascript(err, file, res)});
});

app.get('/js/client.js', function (req, res) {
  fs.readFile(__dirname + '/js/client.js', function (err, file){sendJavascript(err, file, res)});
  // dns.lookup(os.hostname(), function (err, add, fam) {
  //   var stream = mu.compileAndRender(__dirname + '/js/client.js', {lien: add + ':8080/'});
  //   stream.pipe(res);
  // });
});

app.get('/css/style.css', function (req, res) {
  fs.readFile(__dirname + '/css/style.css', function (err, file){sendCss(err, file, res)});
});

app.get('/css/bg.png', function (req, res) {
  fs.readFile(__dirname + '/css/bg.png', function (err, file){sendPng(err, file, res)});
});

app.get('/css/wood.jpg', function (req, res) {
  fs.readFile(__dirname + '/css/wood.jpg', function (err, file){sendJpg(err, file, res)});
});

app.get('/img/tipFooter.gif', function (req, res) {
  fs.readFile(__dirname + '/img/tipFooter.gif', function (err, file){sendPng(err, file, res)});
});

app.get('/img/tipHeader.gif', function (req, res) {
  fs.readFile(__dirname + '/img/tipHeader.gif', function (err, file){sendPng(err, file, res)});
});

http.listen(8080);

/**
* fonctions
**/

function sendJavascript(err, file, res){
  if (err) throw err;
  res.setHeader('content-type', 'text/javascript');
  res.write(file, "utf-8");
  res.end();
}

function sendCss(err, file, res){
  if (err) throw err;
  res.setHeader('content-type', 'text/css');
  res.write(file, "utf-8");
  res.end();
}

function sendJpg(err, file, res){
  if (err) throw err;
  res.setHeader('content-type', 'image/jpeg');
  res.write(file, "utf-8");
  res.end();
}

function sendPng(err, file, res){
  if (err) throw err;
  res.setHeader('content-type', 'image/png');
  res.write(file, "utf-8");
  res.end();
}

/**
* Serveur temps réel
**/
var users = {};
var messages = [];
var history = 5;

io.sockets.on('connection', function(socket){

  var me = false;

  for(var k in users){
    socket.emit('newusr', users[k]);
  }
  for(var k in messages){
    socket.emit('newmsg', messages[k]);
  }

  /**
  * Reception d'un message
  **/
  socket.on('newmsg', function(message){
    message.user = me;
    date = new Date();
    message.h = date.getHours();
    message.m = date.getMinutes();
    messages.push(message);
    if(messages.length > history){
      messages.shift();
    }
    io.sockets.emit('newmsg', message);
  });

  /**
  * Connexion
  **/
  socket.on('login', function(user){
    me = user;
    me.id = user.mail.replace('@','-').replace(/\./g,'-');
    me.avatar = "http://www.gravatar.com/avatar/" + md5(user.mail) + "?s=50";
    socket.emit('logged');
    users[me.id] = me;
    io.sockets.emit('newusr', me);
  });

  /**
  * Deconnexion
  **/
  socket.on('disconnect', function(){
    if(!me){
      return false;
    }
    delete users[me.id];
    io.sockets.emit('disusr', me);
  });
});
