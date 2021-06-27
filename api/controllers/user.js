"use strict";

var conf = require("../configuration/conf");
var bcrypt = require("bcrypt-nodejs");
var mongoosePaginate = require("mongoose-pagination");
var User = require("../models/user");
var Follow = require("../models/follow");
var Publication = require("../models/publication");
var jwt = require("../services/jwt");
var fs = require("fs");
var path = require("path");

function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = "ROLE_USER";
        user.image = null;

        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() },
            ],
        }).exec((err, users) => {
            if (err) {
                return res.status(500).send({
                    message: "Error in user required",
                });
            }

            if (users && users.length >= 1) {
                return res.status(200).send({
                    message: "User repeated, try again",
                });
            }

            bcrypt.hash(params.password, null, null, (err, hash) => {
                user.password = hash;

                user.save((err, userStored) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error when try to save the user",
                        });
                    }

                    if (userStored) {
                        res.status(200).send({
                            user: userStored,
                        });
                    } else {
                        res.status(404).send({ message: "No" });
                    }
                });
            });

            // user.password = params.password;
        });
    } else {
        res.status(200).send({
            message: "Fill require fields",
        });
    }
}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email }, (err, user) => {
        if (err)
            return res.status(500).send({
                message: "Request Error",
            });

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    user.password = undefined;
                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user),
                        });
                    } else {
                        return res.status(200).send({
                            user,
                        });
                    }
                } else {
                    return res.status(404).send({ message: "Error Login" });
                }
            });
        } else {
            return res.status(404).send({ message: "Error Login" });
        }
    });
}

// function getUser(req, res) {
//     var userId = req.params.id;

//     User.findById(userId, (err, user) => {
//         if (err)
//             return res.status(500).send({
//                 message: "Request error",
//             });

//         if (!user)
//             return res.status(404).send({
//                 message: "User not exist",
//             });

//         return res.status(200).send(user);
//     });
// }

// function getUser(req, res) {
//     var userId = req.params.id;

//     User.findById(userId, (err, user) => {
//         if (err)
//             return res.status(500).send({
//                 message: "Request error",
//             });

//         if (!user)
//             return res.status(404).send({
//                 message: "User not exist",
//             });

//         Follow.findOne({ user: req.user.sub, followed: userId }).exec(
//             (err, follow) => {
//                 if (err)
//                     return res.status(500).send({
//                         message: "Request error",
//                     });

//                 return res.status(200).send({ user, follow });
//             }
//         );
//     });
// }

function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err)
            return res.status(500).send({
                message: "Request error",
            });

        if (!user)
            return res.status(404).send({
                message: "User not exist",
            });

        followThisUser(req.user.sub, userId).then((response) => {
            user.password = undefined;

            // console.log("[ getUser api ] ::: ", response);

            return res.status(200).send({
                user,
                following: response.following,
                followed: response.followed,
            });
        });
    });
}

async function followThisUser(identityUserId, userId) {
    var following = await Follow.findOne({
        user: identityUserId,
        followed: userId,
    })
        .then((follow) => follow)
        .catch((err) => handleError(err));
    // }).exec((err, follow) => {
    //     if (err) return handleError(err);

    //     return follow;
    // });

    var followed = await Follow.findOne({
        user: userId,
        followed: identityUserId,
    })
        .then((follow) => follow)
        .catch((err) => handleError(err));
    // }).exec((err, follow) => {
    //     if (err) return handleError(err);

    //     return follow;
    // });

    return {
        following: following,
        followed: followed,
    };
}

// function getUsers(req, res) {
//     // var identity_user_id = req.user.sub;
//     var page = req.params.page ? req.params.page : 1;
//     var itemsPerPage = 5;

//     User.find()
//         .sort("_id")
//         .paginate(page, itemsPerPage, (err, users, total) => {
//             if (err)
//                 return res.status(500).send({
//                     message: "Request error",
//                 });

//             if (!users)
//                 return res.status(404).send({
//                     message: "No users available",
//                 });

//             return res.status(200).send({
//                 users,
//                 total,
//                 pages: Math.ceil(total / itemsPerPage),
//             });
//         });
// }

function getUsers(req, res) {
    var identity_user_id = req.user.sub;
    var page = req.params.page ? req.params.page : 1;
    var itemsPerPage = 5;

    User.find()
        .sort("_id")
        .paginate(page, itemsPerPage, (err, users, total) => {
            if (err)
                return res.status(500).send({
                    message: "Request error",
                });

            if (!users)
                return res.status(404).send({
                    message: "No users available",
                });

            followUserIds(identity_user_id).then((response) => {
                return res.status(200).send({
                    users,
                    users_following: response.following,
                    users_follow_me: response.followed,
                    total,
                    pages: Math.ceil(total / itemsPerPage),
                });
            });
        });
}

async function followUserIds(userId) {
    // console.log("[ followUserIds userId ] ::: ", userId);

    var following = await Follow.find({ user: userId })
        .select({
            _id: 0,
            _v: 0,
            // user: 0,
        })
        .then((follows) => {
            var followsClean = [];

            follows.forEach((follow) => {
                followsClean.push(follow.followed);
            });

            // console.log(
            //     "[ following follows followsClean ] ::: ",
            //     follows,
            //     followsClean
            // );

            return followsClean;
        })
        .catch((err) => {
            return handleError(err);
        });
    // .exec((err, follows) => {
    //     if (err) return handleError(err);

    //     var followsClean = [];

    //     follows.forEach((follow) => {
    //         followsClean.push(follow.followed);
    //     });

    //     console.log(
    //         "[ following follows followsClean ] ::: ",
    //         follows,
    //         followsClean
    //     );

    //     return followsClean;
    // });

    var followed = await Follow.find({ followed: userId })
        .select({
            _id: 0,
            _v: 0,
            // followed: 0,
        })
        .then((follows) => {
            var followsClean = [];

            follows.forEach((follow) => {
                followsClean.push(follow.user);
            });

            // console.log(
            //     "[ followed follows followsClean ] ::: ",
            //     follows,
            //     followsClean
            // );

            return followsClean;
        })
        .catch((err) => {
            return handleError(err);
        });
    // .exec((err, follows) => {
    //     if (err) return handleError(err);

    //     var followsClean = [];

    //     follows.forEach((follow) => {
    //         followsClean.push(follow.user);
    //     });

    //     console.log(
    //         "[ followed follows followsClean ] ::: ",
    //         follows,
    //         followsClean
    //     );

    //     return followsClean;
    // });

    // console.log("[ following ] ::: ", following);
    // console.log("[ followed ] ::: ", followed);

    return {
        following: following,
        followed: followed,
    };
}

function getCounters(req, res) {
    var userId = req.user.sub;

    if (req.param.id) {
        userId = req.param.id;
    }

    getCountFollow(userId).then((response) => {
        return res.status(200).send(response);
    });
}

async function getCountFollow(userId) {
    var following = await Follow.count({ user: userId })
        .then((count) => count)
        .catch((err) => handleError(err));
    // .exec((err, count) => {
    //     if (err) return handleError(err);

    //     return count;
    // });

    var followed = await Follow.count({ followed: userId })
        .then((count) => count)
        .catch((err) => handleError(err));
    // .exec(
    //     (err, count) => {
    //         if (err) return handleError(err);

    //         return count;
    //     }
    // );

    var publications = await Publication.count({ user: userId })
        .then((publications) => publications)
        .catch((err) => handleError(err));
    // .exec(
    //     (err, publications) => {
    //         if (err) return handleError(err);

    //         return publications;
    //     }
    // );

    return {
        following: following || 0,
        followed: followed || 0,
        publications: publications || 0,
    };
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    delete update.password;

    if (userId !== req.user.sub) {
        return res.status(500).send({
            message: "You are not authorize to modify other data user",
        });
    }

    User.findOne({
        $or: [
            { email: update.email.toLowerCase() },
            { nick: update.nick.toLowerCase() },
        ],
    }).exec((error, user) => {
        if (user && user.id !== userId)
            return res.status(404).send({
                message: "the information is already in use",
            });

        User.findByIdAndUpdate(
            userId,
            update,
            { new: true },
            (err, userUpdated) => {
                if (err)
                    return req.status(500).send({
                        message: "Request error",
                    });

                if (!userUpdated)
                    return res.status(404).send({
                        message: "The user could not be updated",
                    });

                return res.status(200).send({ user: userUpdated });
            }
        );
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;
    var update = req.body;

    delete update.password;

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split("\\");
        var file_name = file_split[2];
        var ext_split = file_name.split(".");
        var file_ext = ext_split[1];

        if (userId !== req.user.sub) {
            removeUploadedFiles(
                res,
                file_path,
                "You are not authorize to modify other data user"
            );
        }

        if (
            file_ext === "png" ||
            file_ext === "jpg" ||
            file_ext === "jpeg" ||
            file_ext === "gif"
        ) {
            User.findByIdAndUpdate(
                userId,
                { image: file_name },
                { new: true },
                (err, user) => {
                    if (err)
                        return req.status(500).send({
                            message: "Request error",
                        });

                    if (!user)
                        return res.status(404).send({
                            message: "The user could not be updated",
                        });

                    return res.status(200).send({ user });
                }
            );
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
    var path_file = `${conf.uploadUserImages}/${image_file}`;

    fs.exists(path_file, (exists) => {
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
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile,
};
