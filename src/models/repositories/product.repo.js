"use strict";

const { unGetSelectData } = require("../../utils");
const { product } = require("../product.model");
const { Types } = require("mongoose");

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const { modifiedCount } = await product.updateOne(
    {
      _id: new Types.ObjectId(product_id),
      product_shop: new Types.ObjectId(product_shop),
    },
    {
      $set: {
        isDraft: false,
        isPublished: true,
      },
    },
  );

  return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const { modifiedCount } = await product.updateOne(
    {
      _id: new Types.ObjectId(product_id),
      product_shop: new Types.ObjectId(product_shop),
    },
    {
      $set: {
        isDraft: true,
        isPublished: false,
      },
    },
  );

  return modifiedCount;
};

const searchProductsByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      {
        score: { $meta: "textScore" },
      },
    )
    .sort({
      score: { $meta: "textScore" },
    })
    .lean()
    .exec();
  return results;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(select)
    .lean()
    .exec();

  return products;
};

const findProduct = async ({ product_id, unSelect = [] }) => {
  return await product
    .findById(product_id)
    .select(unGetSelectData(unSelect))
    .lean()
    .exec();
};

const updateProductById = async ({
  product_id,
  payload,
  model,
  isNew = true,
}) => {
  return await model
    .findByIdAndUpdate(product_id, payload, {
      returnDocument: isNew ? "after" : "before",
    })
    .lean()
    .exec();
};

module.exports = {
  publishProductByShop,
  unPublishProductByShop,
  queryProduct,
  searchProductsByUser,
  findAllProducts,
  findProduct,
  updateProductById,
};
