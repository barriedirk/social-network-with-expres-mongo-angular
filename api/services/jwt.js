"use strict";

var jwt = require("jwt-simple");
var moment = require("moment");
var conf = require("../configuration/conf");

exports.createToken = function (user) {
    var payload = {
        sub: user._id,
        nick: user.nick,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.image,
        image: user.image,
        lat: moment().unix(),
        exp: moment().add(30, "days").unix,
    };

    return jwt.encode(payload, conf.secret);
};
