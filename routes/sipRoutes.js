const express = require("express");
const router = express.Router();
const sipControllers = require("../controllers/sipControllers");
router.post('/', sipControllers.getSip);
module.exports = router;