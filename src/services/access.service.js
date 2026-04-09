"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeytokenService = require("./keytoken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const keyStoreService = require("./keytoken.service");
const {
  ConflictRequestError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "shop",
  WRITER: "writer",
  EDITOR: "editor",
  ADMIN: "admin",
};

class AccessService {
  static handleRefreshToken = async ({ keyStore, refreshToken, user }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await keyStoreService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happend !! Please login ");
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new UnauthorizedError("Invalid refresh token");

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new UnauthorizedError("Shop not found");

    const tokens = createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey,
    );

    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken,
      },
    });

    return {
      user,
      tokens,
    };
  };
  /*
    Step 1: Tìm user theo email
    Step 2: So sánh password
    Step 3: Tạo access token + refresh token
    Step 4: Lưu refresh token vào DB
    Step 5: Trả token về client
  */
  static login = async ({ email, password, refreshToken = null }) => {
    const hoderShop = await findByEmail({ email });
    if (!hoderShop) {
      throw new BadRequestError("Shop not found");
    }

    const match = await bcrypt.compare(password, hoderShop.password);
    if (!match) {
      throw new UnauthorizedError("Invalid password");
    }

    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");
    const tokens = createTokenPair(
      { userId: hoderShop._id, email },
      publicKey,
      privateKey,
    );
    if (!tokens) {
      throw new ConflictRequestError("Create token failed");
    }

    await KeytokenService.createKeyToken({
      userId: hoderShop._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: hoderShop,
      }),
      tokens,
    };
  };

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
        shop: getInfoData({
          fields: ["_id", "name", "email"],
          object: newShop,
        }),
        tokens,
      };
    }

    return null;
  };

  static logout = async ({ keyStore }) => {
    const delKey = await KeytokenService.removeKeyById(keyStore._id);
    return delKey;
  };
}

module.exports = AccessService;
