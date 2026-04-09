"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getListSearchProducts),
);

router.get("/", asyncHandler(productController.getListProducts));

router.get("/:id", asyncHandler(productController.getProductDetail));

// Authentication
router.use(authentication);
//////////
router.post("/create", asyncHandler(productController.createProduct));
router.patch("/update/:id", asyncHandler(productController.updateProduct));
router.get("/drafts", asyncHandler(productController.getAllDraftsForShop));
router.get("/published", asyncHandler(productController.getPublishedProducts));
router.patch(
  "/unpublish/:id",
  asyncHandler(productController.unPublishProduct),
);
router.patch("/publish/:id", asyncHandler(productController.publishProduct));

module.exports = router;
