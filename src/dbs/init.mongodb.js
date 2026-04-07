"use strict";

const mongoose = require("mongoose");
const {
  db: { host, port, name },
} = require("../config/config.mongodb");
const { countConnect } = require("../helpers/check.connect");

const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString)
      .then(() => {
        console.log("Connected to MongoDB", countConnect());
      })
      .catch((err) => {
        console.log("Error connecting to MongoDB");
      });
  }

  //Singleton pattern: Chỉ tạo ra 1 instance duy nhất
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongoDB = Database.getInstance();

module.exports = instanceMongoDB;
