const Faculty = require("../models/Faculty");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const addFaculty = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            facultyId,
            department,
            designation,
            subjects,
            office,
            room,
            campusZone
        } = req.body;

        console.log("ADD FACULTY REQUEST:");
        console.log(req.body);

        if (
            !name ||
            !email ||
            !password ||
            !facultyId ||
            !department ||
            !designation
        ) {
            return res.status(400).json({
                message: "Please provide all required faculty details"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "A user with this email already exists"
            });
        }

        const existingFaculty = await Faculty.findOne({
            facultyId
        });

        if (existingFaculty) {
            return res.status(400).json({
                message: "Faculty ID already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "faculty"
        });

        console.log("USER SAVED TO MONGODB:");
        console.log(user);

        const faculty = await Faculty.create({
            userId: user._id,
            facultyId,
            department,
            designation,
            subjects: subjects || [],
            office: office || "",
            room: room || "",
            campusZone: campusZone || "Other"
        });

        console.log("FACULTY SAVED TO MONGODB:");
        console.log(faculty);

        res.status(201).json({
            message: "Faculty added successfully",
            faculty
        });

    } catch (error) {

        console.error("ADD FACULTY ERROR:");
        console.error(error);

        res.status(500).json({
            message: "Failed to add faculty",
            error: error.message
        });

    }
};


const getFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find()
            .populate("userId", "name email");

        const now = new Date();

        const updatedFaculty = faculty.map((member) => {
            const facultyData = member.toObject();

            if (
                facultyData.availableUntil &&
                new Date(facultyData.availableUntil) <= now &&
                (
                    facultyData.availabilityStatus === "Available" ||
                    facultyData.availabilityStatus === "Probably Available"
                )
            ) {
                facultyData.availabilityStatus = "Status Unknown";
                facultyData.availableUntil = null;
            }

            return facultyData;
        });

        res.json({
            count: updatedFaculty.length,
            faculty: updatedFaculty
        });

    } catch (error) {

        console.error("GET FACULTY ERROR:");
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch faculty",
            error: error.message
        });

    }
};


const updateAvailability = async (req, res) => {
    try {

        const {
            userId,
            availabilityStatus,
            availableUntil
        } = req.body;

        if (!userId || !availabilityStatus) {
            return res.status(400).json({
                message: "User ID and availability status are required"
            });
        }

        const user = await User.findById(userId);

        if (!user || user.role !== "faculty") {
            return res.status(404).json({
                message: "Faculty user not found"
            });
        }

        const faculty = await Faculty.findOne({
            userId
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        faculty.availabilityStatus =
            availabilityStatus;

        faculty.availableUntil =
            availableUntil || null;

        await faculty.save();

        res.json({
            message: "Availability updated successfully",
            faculty
        });

    } catch (error) {

        console.error("UPDATE AVAILABILITY ERROR:");
        console.error(error);

        res.status(500).json({
            message: "Failed to update availability",
            error: error.message
        });

    }
};


const updateLocation = async (req, res) => {
    try {

        const {
            userId,
            campusZone,
            locationSharing
        } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const user = await User.findById(userId);

        if (!user || user.role !== "faculty") {
            return res.status(404).json({
                message: "Faculty user not found"
            });
        }

        const faculty = await Faculty.findOne({
            userId
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        if (campusZone) {
            faculty.campusZone =
                campusZone;
        }

        if (typeof locationSharing === "boolean") {
            faculty.locationSharing =
                locationSharing;
        }

        faculty.lastLocationUpdate =
            new Date();

        await faculty.save();

        res.json({
            message: "Location updated successfully",
            faculty
        });

    } catch (error) {

        console.error("UPDATE LOCATION ERROR:");
        console.error(error);

        res.status(500).json({
            message: "Failed to update location",
            error: error.message
        });

    }
};


module.exports = {
    addFaculty,
    getFaculty,
    updateAvailability,
    updateLocation
};