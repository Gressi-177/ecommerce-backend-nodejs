"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeytokenService = require("./keytoken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const RoleShop = {
  SHOP: "shop",
  WRITER: "writer",
  EDITOR: "editor",
  ADMIN: "admin",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      //1. Check email exist
      const hoderShop = await shopModel.findOne({ email }).lean();
      if (hoderShop) {
        return {
          code: "xxx",
          message: "Email already exists",
          status: "error",
        };
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
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        });

        //5. Save key to database
        const publicKeyString = await KeytokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });
        if (!publicKeyString) {
          return {
            code: "xxx",
            message: "Create key token failed",
            status: "error",
          };
        }

        const publicKeyObject = crypto.createPublicKey(publicKeyString);

        //6. Create token
        const tokens = createTokenPair(
          { userId: newShop._id, email },
          publicKeyObject,
          privateKey,
        );
        if (!tokens) {
          return {
            code: "xxx",
            message: "Create token failed",
            status: "error",
          };
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
        code: 400,
        message: "Invalid shop",
        status: "error",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
