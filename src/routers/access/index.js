"use strict";

const express = require("express");
const accessController = require("../../controllers/acccess.controller");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");

//Sign up
router.post("/shop/signup", asyncHandler(accessController.signUp));

module.exports = router;
