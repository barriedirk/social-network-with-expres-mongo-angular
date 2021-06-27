"use strict";

var express = require("express");
var TestController = require("../controllers/test");
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get("/home", TestController.home);
api.post("/test", TestController.test);
api.post("/test-token", md_auth.ensureAuth ,TestController.test);


module.exports = api;
