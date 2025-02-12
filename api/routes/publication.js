"use strict";

var conf = require("../configuration/conf");
var express = require("express");
var PublicationController = require("../controllers/publication");
var api = express.Router();
var md_auth = require("../middlewares/authenticated");
var multipart = require("connect-multiparty");
var md_upload = multipart({ uploadDir: conf.uploadPublication });

api.get(
    "/test-publication",
    md_auth.ensureAuth,
    PublicationController.testPublication
);
api.post(
    "/publication",
    md_auth.ensureAuth,
    PublicationController.savePublication
);
api.get(
    "/publications/:page?",
    md_auth.ensureAuth,
    PublicationController.getPublications
);
api.get(
    "/publications-user/:userId/:page?",
    md_auth.ensureAuth,
    PublicationController.getPublicationsUser
);
api.get(
    "/publication/:id",
    md_auth.ensureAuth,
    PublicationController.getPublication
);
api.delete(
    "/publication/:id",
    md_auth.ensureAuth,
    PublicationController.deletePublication
);
api.post(
    "/upload-image-pub/:id",
    [md_auth.ensureAuth, md_upload],
    PublicationController.uploadImage
);
api.get(
    "/get-image-pub/:imageFile",
    PublicationController.getImageFile
);
module.exports = api;
