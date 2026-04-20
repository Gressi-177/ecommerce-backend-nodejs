"use strict";

const pick = require("lodash/pick");
const pickBy = require("lodash/pickBy");
const { Types } = require("mongoose");

const convertToObjectId = (id) => new Types.ObjectId(id);

const getInfoData = ({ fields = [], object = {} }) => {
  return pick(object, fields);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeUndefinedObject = (obj) => {
  return pickBy(obj, (value) => value !== undefined);
};

/**
 * Hàm updateNestedObjectParser dùng để chuyển một object lồng nhau (nested object)
 * thành một object phẳng (flattened object) với key là chuỗi nối bằng dấu chấm (dot notation).
 * Mục đích: Phù hợp để sử dụng trong các thao tác update trong MongoDB, ví dụ như $set,
 * nơi cần chỉ định đường dẫn đến thuộc tính con bằng chuỗi.
 *
 * @param {Object} obj - Object lồng nhau cần được làm phẳng.
 * @returns {Object} Object phẳng với key dạng dot notation trỏ đến thuộc tính con.
 *
 * Ví dụ:
 *   Input: { a: 1, b: { c: 2, d: 3 } }
 *   Output: { a: 1, "b.c": 2, "b.d": 3 }
 */
const updateNestedObjectParser = (obj) => {
  const final = {};

  Object.keys(obj).forEach((key) => {
    // Nếu giá trị là object (và không phải array), tiếp tục đệ quy để làm phẳng các thuộc tính con
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const res = updateNestedObjectParser(obj[key]);
      Object.keys(res).forEach((item) => {
        // Nối tên key cha và key con bằng dấu chấm
        final[`${key}.${item}`] = res[item];
      });
    } else {
      // Nếu giá trị là primitive hoặc array thì lấy nguyên giá trị đó
      final[key] = obj[key];
    }
  });

  return final;
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectId,
};
