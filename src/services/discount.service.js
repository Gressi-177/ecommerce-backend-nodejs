"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  convertToObjectId,
  removeUndefinedObject,
  updateNestedObjectParser,
} = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
  findAllDiscountCodesUnselect,
} = require("../models/repositories/discount.repo");
class DiscountService {
  static createDiscountCode = async ({
    code,
    start_date,
    end_date,
    is_active,
    shop_id,
    min_order_value,
    product_ids,
    applies_to,
    name,
    description,
    type,
    value,
    max_value,
    max_uses,
    uses_count,
    max_uses_per_user,
  }) => {
    if (new Date(start_date) < new Date()) {
      throw new BadRequestError("Start date must be in the future");
    }

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError("Start date must be before end date");
    }

    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shop_id),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount code already exists");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_min_order_value: min_order_value || 0,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses: uses_count,
      discount_users_used: [],
      discount_max_uses_per_user: max_uses_per_user,
      discount_shopId: convertToObjectId(shop_id),
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  };

  static updateDiscountCode = async ({
    discount_id,
    shop_id,
    name,
    description,
    type,
    value,
    code,
    start_date,
    end_date,
    min_order_value,
    max_uses,
    max_uses_per_user,
    is_active,
    applies_to,
    product_ids,
  }) => {
    const foundDiscount = await discountModel
      .findOne({
        _id: convertToObjectId(discount_id),
        discount_shopId: convertToObjectId(shop_id),
      })
      .lean();

    if (!foundDiscount) {
      throw new NotFoundError("Discount not found");
    }

    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError("Start date must be before end date");
    }

    if (end_date && new Date(end_date) < new Date()) {
      throw new BadRequestError("End date must be in the future");
    }

    const payload = removeUndefinedObject({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: start_date ? new Date(start_date) : undefined,
      discount_end_date: end_date ? new Date(end_date) : undefined,
      discount_min_order_value: min_order_value,
      discount_max_uses: max_uses,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids:
        applies_to === "all"
          ? []
          : applies_to === "specific"
            ? product_ids
            : undefined,
    });

    return await discountModel.findByIdAndUpdate(
      discount_id,
      { $set: updateNestedObjectParser(payload) },
      { new: true },
    );
  };

  static getAllProductsWithDiscountCodes = async ({
    code,
    shop_id,
    limit = 50,
    page = 1,
  }) => {
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shop_id),
      })
      .lean();

    if (!foundDiscount) {
      throw new NotFoundError("Discount not found");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shop_id),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids.map(convertToObjectId) },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  };

  static getAllDiscountCodesByShop = async ({
    shop_id,
    limit = 50,
    page = 1,
  }) => {
    const discountCodes = await findAllDiscountCodesUnselect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectId(shop_id),
      },
      unselect: ["__v", "discount_product_ids"],
    });
    return discountCodes;
  };
}

module.exports = DiscountService;
