//==================================================================//

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const server = express();

server.listen(3000, () => {
  console.log("Server Running at http://localhost:3000/");
});

server.use(express.json());

//==================================================================//

let databaseConnection = null;

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const getConnection = async (dbName) => {
  const path = require("path");
  const dbPath = path.join(__dirname, dbName);
  try {
    databaseConnection = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("And Database initialized...");
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
  return databaseConnection;
};

//==================================================================//

exports.getConnection = getConnection;
exports.server = server;
exports.bcrypt = bcrypt;
exports.jwt = jwt;

//==================================================================//
