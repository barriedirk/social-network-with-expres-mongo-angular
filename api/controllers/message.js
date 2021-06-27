"use strict";

var moment = require("moment");
var mongoosePaginate = require("mongoose-pagination");
var User = require("../models/user");
var Follow = require("../models/follow");
var Message = require("../models/message");

function test(req, res) {
    res.status(200).send({
        messag: "Test from message controller",
    });
}

function saveMessage(req, res) {
    var params = req.body;

    if (!params.text || !params.receiver)
        return res.status(200).send({
            message: "Missing require fields",
        });

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = "false";

    message.save((err, messageStored) => {
        if (err)
            return res.status(500).send({
                message: "Server error",
            });

        if (!messageStored)
            return res.status(404).send({
                message: "Error to send the message",
            });

        res.status(200).send({
            message: messageStored,
        });
    });
}

function getReceivedMessage(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ receiver: userId })
        .populate("emitter", "name surname image nick _id")
        .sort('-created_at')
        .paginate(page, itemsPerPage, (err, messages, total) => {
            if (err)
                return res.status(500).send({
                    message: "Server error",
                });

            if (!messages)
                return res.status(404).send({
                    message: "No messages to show",
                });

            return res.status(200).send({
                total,
                pages: Math.ceil(total / itemsPerPage),
                page,
                messages,
            });
        });
}

function getEmmitMessage(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ emitter: userId })
        .populate("emitter receiver", "name surname image nick _id")
        .sort('-created_at')
        .paginate(page, itemsPerPage, (err, messages, total) => {
            if (err)
                return res.status(500).send({
                    message: "Server error",
                });

            if (!messages)
                return res.status(404).send({
                    message: "No messages to show",
                });

            return res.status(200).send({
                total,
                pages: Math.ceil(total / itemsPerPage),
                page,
                messages,
            });
        });
}

function getUnviewedMessages(req, res) {
    var userId = req.user.sub;

    Message.count({ receiver: userId, viewed: "false" }).exec((err, count) => {
        if (err)
            return res.status(500).send({
                message: "Server error",
            });

        return res.status(200).send({
            unviewed: count,
        });
    });
}

function setViewedMessage(req, res) {
    var userId = req.user.sub;

    Message.update(
        { receiver: userId, viewed: "false" },
        { viewed: "true" },
        { multi: true },
        (err, messageUpdated) => {
            if (err)
                return res.status(500).send({
                    message: "Server error",
                });

            return res.status(200).send({
                messages: messageUpdated,
            });
        }
    );
}

module.exports = {
    test,
    saveMessage,
    getReceivedMessage,
    getEmmitMessage,
    getUnviewedMessages,
    setViewedMessage,
};
