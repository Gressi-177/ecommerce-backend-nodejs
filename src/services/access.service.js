"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeytokenService = require("./keytoken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  ConflictRequestError,
  BadRequestError,
} = require("../core/error.response");
const RoleShop = {
  SHOP: "shop",
  WRITER: "writer",
  EDITOR: "editor",
  ADMIN: "admin",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    //1. Check email exist
    const hoderShop = await shopModel.findOne({ email }).lean();
    if (hoderShop) {
      throw new ConflictRequestError("Shop already registered");
    }

    //2. Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    //3. Create new shop
    const newShop = await shopModel.create({
      name,
      email,
      password: hashPassword,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      //4. Generate key
      // const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });
      const publicKey = crypto.randomBytes(64).toString("hex");
      const privateKey = crypto.randomBytes(64).toString("hex");

      //5. Save key to database
      const keyStore = await KeytokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new ConflictRequestError("Create key token failed");
      }

      //6. Create token
      const tokens = createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey,
      );
      if (!tokens) {
        throw new ConflictRequestError("Create token failed");
      }

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
