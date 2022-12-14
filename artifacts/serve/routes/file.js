const debug = require("debug")("route:chart");
const chartHandle = require("../handles/chart");
const camelCase = require("camelcase");
const express = require("express");
const multer = require("multer");

const router = express.Router();


