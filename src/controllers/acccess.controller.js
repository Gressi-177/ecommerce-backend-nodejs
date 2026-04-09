"use strict";

const accessService = require("../services/access.service");
const { CREATED, SuccessResponse } = require("../core/success.response");

class AccessController {
  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Refresh token success",
      metadata: await accessService.handleRefreshToken({
        keyStore: req.keyStore,
        refreshToken: req.refreshToken,
        user: req.user,
      }),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      message: "Login success",
      metadata: await accessService.login(req.body),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    new CREATED({
      message: "Register success",
      metadata: await accessService.signUp(req.body),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout success",
      metadata: await accessService.logout({ keyStore: req.keyStore }),
    }).send(res);
  };
}

module.exports = new AccessController();
