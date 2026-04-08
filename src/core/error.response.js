"use strict";

const { StatusCodes } = require("http-status-codes");

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(message) {
    super(message, StatusCodes.CONFLICT);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

class UnauthorizedError extends ErrorResponse {
  constructor(message) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(message) {
    super(message, StatusCodes.FORBIDDEN);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
