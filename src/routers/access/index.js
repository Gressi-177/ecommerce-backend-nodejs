"use strict";

const express = require("express");
const accessController = require("../../controllers/acccess.controller");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");

router.post("/signup", asyncHandler(accessController.signUp));
router.post("/login", asyncHandler(accessController.login));

// Authentication
router.use(authentication);
//////////
router.post("/logout", asyncHandler(accessController.logout));
router.post(
  "/handle-refresh-token",
  asyncHandler(accessController.handleRefreshToken),
);

module.exports = router;
