"use strict";

const { Types } = require("mongoose");
const keytokenModel = require("../models/keytoken.model");

class KeytokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken = null,
  }) => {
    const filter = { user: userId },
      update = {
        publicKey,
        privateKey,
        refreshTokenUsed: [],
        refreshToken,
      },
      options = {
        upsert: true,
        returnDocument: "after",
      };
    const keyStore = await keytokenModel.findOneAndUpdate(
      filter,
      update,
      options,
    );

    return keyStore ? keyStore.publicKey : null;
  };

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.findByIdAndDelete(id);
  };
}

module.exports = KeytokenService;
