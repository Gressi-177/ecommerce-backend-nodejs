"use strict";

const crypto = require("crypto");
const apikeyModel = require("../models/apikey.model");

const findApiKey = async (key) => {
  // const newKeyTest = await apikeyModel.create({
  //   key: crypto.randomBytes(64).toString("hex"),
  //   status: true,
  //   permissions: ["0000"],
  // });
  // console.log("🚀 ~ findApiKey ~ newKeyTest:", newKeyTest);
  const objectKey = await apikeyModel.findOne({ key, status: true }).lean();
  return objectKey;
};

module.exports = {
  findApiKey,
};
