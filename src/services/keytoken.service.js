"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeytokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    try {
      const keyStore = await keytokenModel.create({
        user: userId,
        publicKey,
        privateKey,
      });

      return keyStore ? keyStore : null;
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = KeytokenService;
