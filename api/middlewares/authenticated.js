"use strict";

var jwt = require("jwt-simple");
var moment = require("moment");
var conf = require("../configuration/conf");

exports.ensureAuth = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: "The request does not have header authentication",
        });
    }

    var token = req.headers.authorization.replace(/['"]+/g, "");

    try {
        var payload = jwt.decode(token, conf.secret);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                message: "Token is expired",
            });
        }
    } catch (error) {
        return res.status(404).send({
            message: "Invalid token",
        });
    }

    req.user = payload;

    next();
};
