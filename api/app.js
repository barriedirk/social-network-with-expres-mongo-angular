"use strict";

var express = require("express");
var bodyParse = require("body-parser");

var app = express();

// load routes ---
var test_routes = require("./routes/test");
var user_routes = require("./routes/user");
var follow_routes = require("./routes/follow");
var publication_routes = require("./routes/publication");
var message_routes = require("./routes/message");

// load middlewares ---

// Note: For Express version less than 4.16.0
//
//   app.use(bodyParse.urlencoded({ extended: false }));
//   app.use(bodyParse.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// cors ---

// configure http headers
// source: https://victorroblesweb.es/2017/11/09/configurar-cabeceras-acceso-cors-en-nodejs/
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, DELETE"
    );
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");

    next();
});

// routes ---
app.use("/api", test_routes);
app.use("/api", user_routes);
app.use("/api", follow_routes);
app.use("/api", publication_routes);
app.use("/api", message_routes);

// export configuration ---

// only for test ---

/*
app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Hello World'
    })
});

app.get('/test', (req, res) => {
    res.status(200).send({
        message: 'Action test for nodejs'
    })
});
app.post('/test', (req, res) => {
    console.log('[ body ] ::: ', req.body);

    res.status(200).send({
        message: 'Action test for nodejs'
    })
});
*/

module.exports = app;
