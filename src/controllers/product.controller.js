"use strict";

const ProductFactory = require("../services/product.service");
const { CREATED } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    new CREATED({
      message: "Create product success",
      metadata: await ProductFactory.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
