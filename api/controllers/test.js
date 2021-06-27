"use strict";

function home(req, res) {
  res.status(200).send({
    message: "Hello World",
  });
}

function test(req, res) {
  console.log(req.body);

  res.status(200).send({
    message: "Hello World",
  });
}

module.exports = {
  home,
  test
};
