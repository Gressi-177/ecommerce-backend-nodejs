"use strict";

const discountModel = require("../discount.model");
const { unGetSelectData, getSelectData } = require("../../utils");

const findAllDiscountCodesUnselect = async ({
  limit,
  sort,
  page,
  filter,
  unselect,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discountCodes = await discountModel
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unselect))
    .lean()
    .exec();
  return discountCodes;
};

const findAllDiscountCodesSelect = async ({
  limit,
  sort,
  page,
  filter,
  select,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discountCodes = await discountModel
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
    .exec();
  return discountCodes;
};

module.exports = {
  findAllDiscountCodesUnselect,
  findAllDiscountCodesSelect,
};
