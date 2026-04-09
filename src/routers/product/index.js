"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");

// Authentication
router.use(authentication);
//////////
router.post("/create", asyncHandler(productController.createProduct));

module.exports = router;
