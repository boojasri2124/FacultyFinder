const express = require("express");

const {
    addFaculty,
    getFaculty,
    updateAvailability,
    updateLocation
} = require("../controllers/facultyController");

const router = express.Router();

router.post("/", addFaculty);

router.get("/", getFaculty);

router.put("/availability", updateAvailability);

router.put("/location", updateLocation);

module.exports = router;