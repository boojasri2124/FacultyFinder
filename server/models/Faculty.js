const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        subjects: {
            type: [String],
            default: []
        },

        availabilityStatus: {
            type: String,
            enum: [
                "Available",
                "Busy",
                "In Class",
                "Not Available",
                "On Leave"
            ],
            default: "Available"
        },

        availableUntil: {
            type: Date,
            default: null
        },

        campusZone: {
            type: String,
            default: ""
        },

        locationSharing: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Faculty = mongoose.model(
    "Faculty",
    facultySchema
);

module.exports = Faculty;