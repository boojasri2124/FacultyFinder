const express = require("express");

const {
    createMeeting,
    getStudentMeetings,
    getFacultyMeetings,
    updateMeetingStatus,
    cancelMeeting
} = require(
    "../controllers/meetingController"
);

const router =
    express.Router();

router.post(
    "/",
    createMeeting
);

router.get(
    "/student/:studentId",
    getStudentMeetings
);

router.get(
    "/faculty/:facultyId",
    getFacultyMeetings
);

router.put(
    "/status",
    updateMeetingStatus
);

router.put(
    "/cancel",
    cancelMeeting
);

module.exports =
    router;