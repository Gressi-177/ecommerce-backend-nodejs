"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "products";

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      trim: true,
    },
    product_thumb: {
      type: String,
      trim: true,
    },
    product_price: {
      type: Number,
      trim: true,
    },
    product_sold: {
      type: Number,
      trim: true,
    },
    product_type: {
      type: String,
      enum: ["Clothing", "Electronics", "Furniture", "Other"],
      default: "Electronics",
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
    },
    material: {
      type: String,
      trim: true,
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    timestamps: true,
    collection: "clothing",
  },
);

const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
    },
    color: {
      type: String,
      trim: true,
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    timestamps: true,
    collection: "electronic",
  },
);

module.exports = {
  clothing: model("Clothing", clothingSchema),
  electronic: model("Electronic", electronicSchema),
  product: model(DOCUMENT_NAME, productSchema),
};
