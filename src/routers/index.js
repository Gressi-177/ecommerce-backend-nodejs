"use strict";

const express = require("express");
const router = express.Router();
const { apiKey, checkPermission } = require("../auth/checkAuth");

//check api key
router.use(apiKey);

//Check permission
router.use(checkPermission("0000"));

router.use("/v1/api", require("./access"));

module.exports = router;
