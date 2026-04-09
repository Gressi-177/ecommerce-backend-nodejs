"use strict";

const { product, clothing, electronic } = require("../models/product.model");

class ProductFactory {
  static createProduct = async (type, payload) => {
    switch (type) {
      case "Clothing":
        return await new Clothing(payload).createProduct();
      case "Electronic":
        return await new Electronic(payload).createProduct();
      default:
        throw new BadRequestError("Invalid product type");
    }
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
}

module.exports = ProductFactory;
