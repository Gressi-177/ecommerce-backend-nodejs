"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Keytoken";
const COLLECTION_NAME = "keytokens";

const keytokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

module.exports = model(DOCUMENT_NAME, keytokenSchema);
