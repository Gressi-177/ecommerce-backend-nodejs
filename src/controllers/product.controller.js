"use strict";

const ProductFactory = require("../services/product.service");
const { CREATED, SuccessResponse } = require("../core/success.response");

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

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Update product success",
      metadata: await ProductFactory.updateProduct(
        req.body.product_type,
        req.params.id,
        {
          ...req.body,
          product_shop: req.user.userId,
        },
      ),
    }).send(res);
  };

  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all drafts for shop success",
      metadata: await ProductFactory.getDraftProducts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product success",
      metadata: await ProductFactory.publishProduct({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  getPublishedProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get published products success",
      metadata: await ProductFactory.getPublishedProducts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  unPublishProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Unpublish product success",
      metadata: await ProductFactory.unPublishProduct({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  getListSearchProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search products success",
      metadata: await ProductFactory.searchProducts(req.params),
    }).send(res);
  };

  getListProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list products success",
      metadata: await ProductFactory.findAllProducts(req.query),
    }).send(res);
  };

  getProductDetail = async (req, res, next) => {
    new SuccessResponse({
      message: "Get product detail success",
      metadata: await ProductFactory.findProduct({
        product_id: req.params.id,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
