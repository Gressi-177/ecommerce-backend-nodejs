"use strict";

const { BadRequestError } = require("../core/error.response");
const { product, clothing, electronic } = require("../models/product.model");
const {
  publishProductByShop,
  queryProduct,
  unPublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const {
  getSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
} = require("../utils");

class ProductFactory {
  static registry = {};

  static registerProduct = (type, classRef) => {
    ProductFactory.registry[type] = classRef;
  };

  static createProduct = async (type, payload) => {
    const productClass = ProductFactory.registry[type];
    if (!productClass) throw new BadRequestError("Invalid product type");

    return await new productClass(payload).createProduct();
  };

  static updateProduct = async (type, product_id, payload) => {
    const productClass = ProductFactory.registry[type];
    if (!productClass) throw new BadRequestError("Invalid product type");

    return await new productClass(payload).updateProduct(product_id, payload);
  };

  static getDraftProducts = async ({ product_shop, limit = 50, skip = 0 }) => {
    const query = { product_shop, isDraft: true };
    return await queryProduct({ query, limit, skip });
  };

  static publishProduct = async ({ product_shop, product_id }) => {
    return await publishProductByShop({ product_shop, product_id });
  };

  static getPublishedProducts = async ({
    product_shop,
    limit = 50,
    skip = 0,
  }) => {
    const query = { product_shop, isPublished: true };
    return await queryProduct({ query, limit, skip });
  };

  static unPublishProduct = async ({ product_shop, product_id }) => {
    return await unPublishProductByShop({ product_shop, product_id });
  };

  static searchProducts = async ({ keySearch }) => {
    return await searchProductsByUser({ keySearch });
  };

  static findAllProducts = async ({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) => {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: getSelectData(["product_name", "product_price", "product_thumb"]),
    });
  };

  static findProduct = async ({ product_id }) => {
    return await findProduct({
      product_id,
      unSelect: ["__v", "product_variations"],
    });
  };
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_price,
    product_sold,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_price = product_price;
    this.product_sold = product_sold;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  async createProduct(product_id) {
    return await product.create({
      ...this,
      _id: product_id,
    });
  }

  async updateProduct(product_id, payload) {
    return await updateProductById({
      product_id,
      payload,
      model: product,
    });
  }
}

class Clothing extends Product {
  async createProduct(product_id) {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) throw new BadRequestError("Create clothing failed");

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create product failed");

    return newProduct;
  }

  async updateProduct(product_id, payload) {
    const objectParams = removeUndefinedObject(this);

    if (objectParams.product_attributes) {
      await updateProductById({
        product_id,
        payload: {
          product_attributes: updateNestedObjectParser(
            objectParams.product_attributes,
          ),
        },
        model: clothing,
      });
    }

    const updateProduct = await super.updateProduct(
      product_id,
      updateNestedObjectParser(objectParams),
    );

    return updateProduct;
  }
}

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) throw new BadRequestError("Create electronic failed");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create product failed");

    return newProduct;
  }

  async updateProduct(product_id, payload) {
    const objectParams = removeUndefinedObject(this);

    if (objectParams.product_attributes) {
      await updateProductById({
        product_id,
        payload: {
          product_attributes: updateNestedObjectParser(
            objectParams.product_attributes,
          ),
        },
        model: electronic,
      });
    }

    const updateProduct = await super.updateProduct(
      product_id,
      updateNestedObjectParser(objectParams),
    );

    return updateProduct;
  }
}

ProductFactory.registerProduct("Clothing", Clothing);
ProductFactory.registerProduct("Electronic", Electronic);

module.exports = ProductFactory;
