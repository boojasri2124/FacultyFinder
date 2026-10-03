const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        requestedDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "Rejected",
                "Cancelled"
            ],
            default: "Pending"
        },

        facultyResponse: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Meeting = mongoose.model(
    "Meeting",
    meetingSchema
);

module.exports = Meeting;