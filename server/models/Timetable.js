const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true
        },

        day: {
            type: String,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ],
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        room: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Timetable = mongoose.model("Timetable", timetableSchema);

module.exports = Timetable;