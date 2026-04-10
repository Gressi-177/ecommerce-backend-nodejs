"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

const discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },

    discount_type: { type: String, required: true, default: "fixed_amount" }, // fixed_amount, percentage
    discount_value: { type: Number, required: true },
    discount_code: { type: String, required: true },

    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true }, // số lần sử dụng tối đa
    discount_uses: { type: Number, required: true, default: 0 }, // số lần sử dụng
    discount_users_used: { type: Array, required: true, default: [] }, // số lần sử dụng của từng user
    discount_max_uses_per_user: { type: Number, required: true, default: 1 }, // số lần sử dụng tối đa của từng user
    discount_min_order_value: { type: Number, required: true }, // giá trị đơn hàng tối thiểu
    discount_shopId: { type: Schema.Types.ObjectId, ref: "Shop" }, // shopId
    discount_is_active: { type: Boolean, default: true }, // trạng thái
    discount_applies_to: { type: String, required: true, default: "all" }, // all, specific
    discount_product_ids: { type: Array, required: true, default: [] }, // sản phẩm
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

module.exports = model(DOCUMENT_NAME, discountSchema);
