"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const KeytokenService = require("../services/keytoken.service");
const { NotFoundError } = require("../core/error.response");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
  USER_ID: "x-user-id",
};

const createTokenPair = (payload, publicKey, privateKey) => {
  const accessToken = JWT.sign(payload, publicKey, {
    expiresIn: "2 days",
  });
  const refreshToken = JWT.sign(payload, privateKey, {
    expiresIn: "7 days",
  });

  JWT.verify(accessToken, publicKey, (err, decode) => {
    if (err) {
      console.error(`Error verifying access token: ${err}`);
    } else {
      console.log(`Access token decoded:`, decode);
    }
  });

  return { accessToken, refreshToken };
};

/*
1. check userId mising
2. Tìm keystore theo userId
3. verify accessToken
4. so sánh userId trong accessToken với userId trong keystore
5. gán decoded vào req.user
*/
const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.USER_ID];
  if (!userId) throw new UnauthorizedError("Missing userId");

  const keyStore = await KeytokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Key store not found");

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new UnauthorizedError("Missing accessToken");

  try {
    const decoded = JWT.verify(accessToken, keyStore.publicKey);
    if (decoded.userId !== userId)
      throw new UnauthorizedError("Invalid userId in token");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

module.exports = { createTokenPair, authentication };
