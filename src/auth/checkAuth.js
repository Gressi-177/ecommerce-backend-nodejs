"use strict";

const { findApiKey } = require("../services/apikey.service");

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers["x-api-key"];
    if (!key) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const objectKey = await findApiKey(key);
    if (!objectKey) {
      return res.status(403).json({ message: "Invalid API Key" });
    }
    req.objectKey = objectKey;
    return next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.objectKey) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const permissions = req.objectKey.permissions;
    if (!permissions) {
      return res.status(403).json({ message: "No permission" });
    }

    const valid = permissions.includes(permission);
    if (!valid) {
      return res.status(403).json({ message: "Permission denied" });
    }

    return next();
  };
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
module.exports = {
  apiKey,
  checkPermission,
  asyncHandler,
};
