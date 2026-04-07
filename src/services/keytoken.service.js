"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeytokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    const keyStore = await keytokenModel.create({
      user: userId,
      publicKey,
      privateKey,
    });

    return keyStore ? keyStore : null;
  };
}

module.exports = KeytokenService;
