const express = require("express");

const {
    addTimetable,
    getFacultyTimetable,
    deleteTimetable
} = require("../controllers/timetableController");

const router = express.Router();

router.post("/", addTimetable);

router.get("/faculty/:facultyId", getFacultyTimetable);

router.delete("/:id", deleteTimetable);

module.exports = router;