"use strict";

var mongoosePaginate = require("mongoose-pagination");

var User = require("../models/user");
var Follow = require("../models/follow");
const { restart } = require("nodemon");
const { findOneAndUpdate } = require("../models/user");

function test(req, res) {
    res.status(200).send({
        message: "Hello world from follow controller",
    });
}

function saveFollow(req, res) {
    var params = req.body;
    var follow = new Follow();

    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if (err)
            return res.status(500).send({
                message: "Error to save the follow information",
            });

        if (!followStored)
            return res.status(404).send({
                message: "The follow information was not successfully save",
            });

        return res.status(200).send({
            follow: followStored,
        });
    });
}

function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({ user: userId, followed: followId }).remove((err) => {
        if (err)
            return res.status(500).send({
                message: "Error to remove the follow information",
            });

        return res.status(200).send({
            message: "The follow was removed",
        });
    });
}

function getFollowingUsers(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({ user: userId })
        .populate({ path: "followed" })
        .paginate(page, itemsPerPage, (err, follows, total) => {
            if (err)
                return res.status(500).send({
                    message: "Server Error",
                });

            if (!follows)
                return res.status(404).send({
                    message: "There are not follows",
                });

            // followUserIds(userId).then((response) => {
            followUserIds(req.user.sub).then((response) => {
                return res.status(200).send({
                    total: total,
                    pages: Math.ceil(total / itemsPerPage),
                    follows,
                    users_following: response.following,
                    users_follow_me: response.followed,
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

            return followsClean;
        })
        .catch((err) => {
            return handleError(err);
        });

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

            return followsClean;
        })
        .catch((err) => {
            return handleError(err);
        });

    return {
        following: following,
        followed: followed,
    };
}

function getFollowedUsers(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({ followed: userId })
        .populate("user followed")
        .paginate(page, itemsPerPage, (err, follows, total) => {
            if (err)
                return res.status(500).send({
                    message: "Server Error",
                });

            if (!follows)
                return res.status(404).send({
                    message: "You have not any follower ",
                });

            followUserIds(req.user.sub).then((response) => {
                return res.status(200).send({
                    total: total,
                    pages: Math.ceil(total / itemsPerPage),
                    follows,
                    users_following: response.following,
                    users_follow_me: response.followed,
                });
            });
        });
}

function getMyFollows(req, res) {
    var userId = req.user.sub;
    var find = Follow.find({ user: userId });

    if (req.params.followed) {
        find = Follow.find({ followed: userId });
    }

    find.populate("user followed").exec((err, follows) => {
        if (err)
            return res.status(500).send({
                message: "Server Error",
            });

        if (!follows)
            return res.status(404).send({
                message: "You don't follow any body",
            });

        return res.status(200).send({ follows });
    });
}

module.exports = {
    test,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows,
};
