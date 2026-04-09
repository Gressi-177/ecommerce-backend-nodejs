"use strict";

const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "products";

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_slug: String,
    product_description: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_sold: {
      type: Number,
      required: true,
      default: 0,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Clothing", "Electronics", "Furniture", "Other"],
      default: "Electronics",
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },

    product_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      set: (val) => Math.round(val * 10) / 10,
    },

    product_variations: {
      type: Array,
      default: [],
    },

    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);
// Create index for product_name
productSchema.index({ product_name: "text", product_description: "text" });
// Document pre-save middleware
productSchema.pre("save", function () {
  this.product_slug = slugify(String(this.product_name || ""), { lower: true });
});

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
