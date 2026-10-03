const Meeting = require("../models/Meeting");
const Faculty = require("../models/Faculty");
const User = require("../models/User");
const Timetable = require("../models/Timetable");

const timeToMinutes = (time) => {
    if (!time) {
        return 0;
    }

    const [hours, minutes] =
        time.split(":").map(Number);

    return hours * 60 + minutes;
};

const getDayName = (date) => {
    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long"
        }
    );
};

const createMeeting = async (
    req,
    res
) => {
    try {
        const {
            studentId,
            facultyId,
            message,
            reason,
            requestedDate
        } = req.body;

        console.log(
            "MEETING REQUEST:"
        );

        console.log(req.body);

        const meetingReason =
            message || reason;

        if (
            !studentId ||
            !facultyId ||
            !meetingReason ||
            !requestedDate
        ) {
            return res.status(400).json({
                message:
                    "Please provide all meeting details"
            });
        }

        const student =
            await User.findById(
                studentId
            );

        if (
            !student ||
            student.role !==
                "student"
        ) {
            return res.status(404).json({
                message:
                    "Student not found"
            });
        }

        const faculty =
            await Faculty.findById(
                facultyId
            );

        if (!faculty) {
            return res.status(404).json({
                message:
                    "Faculty not found"
            });
        }

        const meetingDate =
            new Date(
                requestedDate
            );

        if (
            isNaN(
                meetingDate.getTime()
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid meeting date"
            });
        }

        const dayName =
            getDayName(
                meetingDate
            );

        const requestedMinutes =
            meetingDate.getHours() *
                60 +
            meetingDate.getMinutes();

        const timetable =
            await Timetable.find({
                facultyId:
                    faculty._id,
                day: dayName
            });

        const conflictingClass =
            timetable.find(
                (entry) => {
                    const start =
                        timeToMinutes(
                            entry.startTime
                        );

                    const end =
                        timeToMinutes(
                            entry.endTime
                        );

                    return (
                        requestedMinutes >=
                            start &&
                        requestedMinutes <
                            end
                    );
                }
            );

        if (
            conflictingClass
        ) {
            return res.status(400).json({
                message:
                    "Faculty is in class at the requested time",

                conflict: {
                    subject:
                        conflictingClass.subject,

                    room:
                        conflictingClass.room,

                    startTime:
                        conflictingClass.startTime,

                    endTime:
                        conflictingClass.endTime
                }
            });
        }

        const meeting =
            await Meeting.create({
                studentId,
                facultyId,
                message:
                    meetingReason,
                requestedDate
            });

        const populatedMeeting =
            await Meeting.findById(
                meeting._id
            )
                .populate(
                    "studentId",
                    "name email"
                )
                .populate({
                    path:
                        "facultyId",
                    populate: {
                        path:
                            "userId",
                        select:
                            "name email"
                    }
                });

        res.status(201).json({
            message:
                "Meeting request sent successfully",
            meeting:
                populatedMeeting
        });

    } catch (error) {
        console.error(
            "CREATE MEETING ERROR:"
        );

        console.error(error);

        res.status(500).json({
            message:
                "Failed to create meeting request",
            error:
                error.message
        });
    }
};

const getStudentMeetings =
    async (
        req,
        res
    ) => {
        try {
            const {
                studentId
            } = req.params;

            const meetings =
                await Meeting.find({
                    studentId
                })
                    .populate({
                        path:
                            "facultyId",
                        populate: {
                            path:
                                "userId",
                            select:
                                "name email"
                        }
                    })
                    .sort({
                        createdAt: -1
                    });

            res.json({
                count:
                    meetings.length,
                meetings
            });

        } catch (error) {
            console.error(
                "GET STUDENT MEETINGS ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch student meetings",
                error:
                    error.message
            });
        }
    };

const getFacultyMeetings =
    async (
        req,
        res
    ) => {
        try {
            const {
                facultyId
            } = req.params;

            const meetings =
                await Meeting.find({
                    facultyId
                })
                    .populate(
                        "studentId",
                        "name email"
                    )
                    .sort({
                        createdAt: -1
                    });

            res.json({
                count:
                    meetings.length,
                meetings
            });

        } catch (error) {
            console.error(
                "GET FACULTY MEETINGS ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch faculty meetings",
                error:
                    error.message
            });
        }
    };

const updateMeetingStatus =
    async (
        req,
        res
    ) => {
        try {
            const {
                meetingId,
                status,
                facultyResponse
            } = req.body;

            if (
                !meetingId ||
                !status
            ) {
                return res.status(400).json({
                    message:
                        "Meeting ID and status are required"
                });
            }

            if (
                status !==
                    "Accepted" &&
                status !==
                    "Rejected"
            ) {
                return res.status(400).json({
                    message:
                        "Invalid meeting status"
                });
            }

            const meeting =
                await Meeting.findById(
                    meetingId
                );

            if (!meeting) {
                return res.status(404).json({
                    message:
                        "Meeting request not found"
                });
            }

            if (
                meeting.status !==
                "Pending"
            ) {
                return res.status(400).json({
                    message:
                        "Only pending meeting requests can be updated"
                });
            }

            meeting.status =
                status;

            meeting.facultyResponse =
                facultyResponse ||
                "";

            await meeting.save();

            const updatedMeeting =
                await Meeting.findById(
                    meeting._id
                )
                    .populate(
                        "studentId",
                        "name email"
                    )
                    .populate({
                        path:
                            "facultyId",
                        populate: {
                            path:
                                "userId",
                            select:
                                "name email"
                        }
                    });

            res.json({
                message:
                    `Meeting request ${status.toLowerCase()}`,
                meeting:
                    updatedMeeting
            });

        } catch (error) {
            console.error(
                "UPDATE MEETING STATUS ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to update meeting request",
                error:
                    error.message
            });
        }
    };

const cancelMeeting =
    async (
        req,
        res
    ) => {
        try {
            const {
                meetingId,
                studentId
            } = req.body;

            console.log(
                "CANCEL MEETING REQUEST:"
            );

            console.log(
                req.body
            );

            if (
                !meetingId ||
                !studentId
            ) {
                return res.status(400).json({
                    message:
                        "Meeting ID and student ID are required"
                });
            }

            const meeting =
                await Meeting.findById(
                    meetingId
                );

            if (!meeting) {
                return res.status(404).json({
                    message:
                        "Meeting request not found"
                });
            }

            if (
                meeting.studentId.toString() !==
                studentId.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You are not allowed to cancel this meeting"
                });
            }

            if (
                meeting.status !==
                "Pending"
            ) {
                return res.status(400).json({
                    message:
                        "Only pending meeting requests can be cancelled"
                });
            }

            meeting.status =
                "Cancelled";

            meeting.facultyResponse =
                "Meeting request cancelled by student.";

            await meeting.save();

            const updatedMeeting =
                await Meeting.findById(
                    meeting._id
                )
                    .populate(
                        "studentId",
                        "name email"
                    )
                    .populate({
                        path:
                            "facultyId",
                        populate: {
                            path:
                                "userId",
                            select:
                                "name email"
                        }
                    });

            res.json({
                message:
                    "Meeting request cancelled successfully",
                meeting:
                    updatedMeeting
            });

        } catch (error) {
            console.error(
                "CANCEL MEETING ERROR:"
            );

            console.error(error);

            res.status(500).json({
                message:
                    "Failed to cancel meeting request",
                error:
                    error.message
            });
        }
    };

module.exports = {
    createMeeting,
    getStudentMeetings,
    getFacultyMeetings,
    updateMeetingStatus,
    cancelMeeting
};