var express = require("express");
var app = express();
var cookie = require("cookie");
var http = require("http").createServer(app);
var path = require("path");
var session = require("express-session");
var bodyParser = require("body-parser");
var customAlphabet = require("nanoid").customAlphabet;

const webpush = require('web-push');
const vapid = require('./secrets/vapid.js');

app.set("trust proxy", 1);
app.use(express.static("build"));
const sessionMiddleware = session({
  secret: "keyboardcat",
  cookie: { maxAge: 35 * 60 * 1000 },
  resave: true,
  saveUninitialized: false,
  rolling: true,
});

app.use(sessionMiddleware);
// server.use(express.cookieParser());

// normal stuff
const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  10
);
app.post("/create", (req, res) => {
  if (req.session.hostOf) {
    req.session.hostOf.push(nanoid());
  } else {
    req.session.hostOf = [nanoid()];
  }
  req.session.save();
  res.status(200).send(req.session.hostOf[req.session.hostOf.length - 1]);
});

app.get("/getSessions", (req, res) => {
  res.send(req.session.hostOf);
});

app.get("/refresh", (req, res) => {
  req.session.touch();
  res.sendStatus(200);
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// push-api based connection

webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

app.get("/vapid", (req, res) => {
  res.send(vapid.publicKey);
});

var streams = {};

app.post("/start", (req, res) => {
  var id = req.body.stream;
  var nsp = req.body.namespace;
  if (id in streams) {
    res.status(403);
    res.send({ message: "Stream already exists" });
  } else {
    streams[id] = {
      namespace: nsp,
      subscribers: Set(),
      data: {}
    };
    res.send({ "message": "Successfully started stream" });
  }
});

app.post("/subscribe", (req, res) => {
  var id = req.body.stream;
  var key = req.body.credentials;
  if (!(id in streams)) {
    res.status(404);
    res.send({ message: "Stream does not exist" });
  } else {
    streams[id].subscribers.add(JSON.stringify(key));
    res.send({
      message: "Successfully subscribed user",
      data: streams[id].data
    });
  }
});

app.post("/update", (req, res) => {
  var id = req.body.stream;
  var payload = req.body.payload;
  var nsp = req.body.namespace;
  if (!(id in streams)) {
    res.status(404);
    res.send({ message: "Stream does not exist" });
  } else if (streams[id].namespace != nsp) {
    res.status(403);
    res.send({ message: "User namespace does not match" });
  } else {
    streams[id].data = payload;
    streams[id].subscribers.forEach(key => {
      webpush.sendNotification(JSON.parse(key), JSON.stringify(payload));
    });
    res.send("Successfully updated status");
  }
});


app.post("/is_host", (req, res) => {
  var id = req.body.stream;
  var nsp = req.body.namespace;
  if (!(id in streams)) {
    res.status(404);
    res.send({ message: "Stream does not exist" });
  } else if (streams[id].namespace != nsp) {
    res.send({ isHost: false });
  } else {
    res.send({ isHost: true });
  }
});


http.listen(process.env.PORT || 5500, () => {
  console.log("listening on *:" + process.env.PORT || 5500);
});