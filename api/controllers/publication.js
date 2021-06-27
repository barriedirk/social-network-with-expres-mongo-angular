"use strict";

var conf = require("../configuration/conf");
var path = require("path");
var fs = require("fs");
var moment = require("moment");
var mongoosePaginate = require("mongoose-pagination");
var Publication = require("../models/publication");
var User = require("../models/user");
var Follow = require("../models/follow");
var moment = require("moment");

function testPublication(req, res) {
    res.status(200).send({
        message: "test from publication controller",
    });
}

function savePublication(req, res) {
    var params = req.body;

    if (!params.text)
        return res.status(200).send({
            message: "Missing text",
        });

    var publication = new Publication();

    publication.text = params.text;
    publication.file = "null";
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored) => {
        if (err)
            return res.status(500).send({
                message: "Error to save the publication",
            });

        if (!publicationStored)
            return res.status(404).send({
                message: "The publication was not saved",
            });

        return res.status(200).send({ publication: publicationStored });
    });
}

function getPublications(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({ user: req.user.sub })
        .populate("followed")
        .exec((err, follows) => {
            if (err)
                return res.status(500).send({
                    message: "Error to fetch the publication list",
                });

            var followsClean = [];

            follows.forEach((follow) => {
                followsClean.push(follow.followed);
            });

            followsClean.push(req.user.sub);

            // console.log("[ follows ] ::: ", follows);

            Publication.find({ user: { $in: followsClean } })
                .sort("-created_at")
                .populate("user")
                .paginate(page, itemsPerPage, (err, publications, total) => {
                    if (err)
                        return res.status(500).send({
                            message: "Error to fetch the publications",
                        });

                    if (!publications)
                        return res.status(404).send({
                            message: "There are not publications",
                        });

                    return res.status(200).send({
                        total: total,
                        pages: Math.ceil(total / itemsPerPage),
                        page: page,
                        itemsPerPage: itemsPerPage,
                        publications,
                    });
                });
        });
}

function getPublicationsUser(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var userId = req.user.sub;
    if (req.params.userId) {
        userId = req.params.userId;
    }

    var itemsPerPage = 4;

    Publication.find({ user: userId })
        .sort("-created_at")
        .populate("user")
        .paginate(page, itemsPerPage, (err, publications, total) => {
            if (err)
                return res.status(500).send({
                    message: "Error to fetch the publications",
                });

            if (!publications)
                return res.status(404).send({
                    message: "There are not publications",
                });

            return res.status(200).send({
                total: total,
                pages: Math.ceil(total / itemsPerPage),
                page: page,
                itemsPerPage: itemsPerPage,
                publications,
            });
        });
}

function getPublication(req, res) {
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if (err)
            return res.status(500).send({
                message: "Error to fetch the publication",
            });

        if (!publication)
            return res.status(404).send({
                message: "The publication not exist",
            });

        return res.status(200).send({ publication });
    });
}

function deletePublication(req, res) {
    var publicationId = req.params.id;

    // Publication.findByIdAndRemove(publicationId, (err, publicationRemove) => {
    Publication.find({ user: req.user.sub, _id: publicationId }).remove(
        (err, publicationRemove) => {
            if (err)
                return res.status(500).send({
                    message: "Error to remove the publication",
                });

            // if (!publicationRemove)
            //     return res.status(404).send({
            //         message: "The publication does not remove",
            //     });

            return res.status(200).send({
                message: "The remove was successfully",
            });
        }
    );
}

function uploadImage(req, res) {
    var publicationId = req.params.id;

    // console.log('[ req.files ] ::: ', req.files);

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split("\\");
        var file_name = file_split[2];
        var ext_split = file_name.split(".");
        var file_ext = ext_split[1];

        if (
            file_ext === "png" ||
            file_ext === "jpg" ||
            file_ext === "jpeg" ||
            file_ext === "gif"
        ) {
            Publication.findOne({
                user: req.user.sub,
                _id: publicationId,
            }).exec((err, publication) => {
                if (publication) {
                    Publication.findByIdAndUpdate(
                        publicationId,
                        { file: file_name },
                        { new: true },
                        (err, publicationUpdated) => {
                            if (err)
                                return req.status(500).send({
                                    message: "Request error",
                                });

                            if (!publicationUpdated)
                                return res.status(404).send({
                                    message:
                                        "The publication could not be updated",
                                });

                            return res
                                .status(200)
                                .send({ publication: publicationUpdated });
                        }
                    );
                } else {
                    return removeUploadedFiles(
                        res,
                        file_path,
                        "You don't have permissions to update this publication"
                    );
                }
            });
        } else {
            removeUploadedFiles(res, file_path, "Not valid extension");
        }
    } else {
        return res.status(200).send({
            message: "No upload image",
        });
    }
}

function removeUploadedFiles(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({
            message,
        });
    });
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = `${conf.uploadPublication}/${image_file}`;

    fs.exists(path_file, (exists) => {
        // console.log('[ exist ] ::: ', path_file);
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({
                message: "Image doesn't exist",
            });
        }
    });
}

module.exports = {
    testPublication,
    savePublication,
    getPublications,
    getPublicationsUser,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile,
};
