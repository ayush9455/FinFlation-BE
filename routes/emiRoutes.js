const express = require("express");
const router = express.Router();
const emiControllers = require("../controllers/emiControllers");
router.post('/', emiControllers.getEmi);
module.exports = router;