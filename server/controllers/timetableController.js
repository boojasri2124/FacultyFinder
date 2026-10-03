const Timetable = require("../models/Timetable");
const Faculty = require("../models/Faculty");

const addTimetable = async (req, res) => {
    try {
        const {
            facultyId,
            day,
            subject,
            startTime,
            endTime,
            room
        } = req.body;

        if (
            !facultyId ||
            !day ||
            !subject ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                message: "Please provide all timetable details"
            });
        }

        const faculty = await Faculty.findById(facultyId);

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        const timetable = await Timetable.create({
            facultyId,
            day,
            subject,
            startTime,
            endTime,
            room: room || ""
        });

        res.status(201).json({
            message: "Timetable added successfully",
            timetable
        });

    } catch (error) {

        console.error("ADD TIMETABLE ERROR:");
        console.error(error);

        res.status(500).json({
            message: "Failed to add timetable",
            error: error.message
        });

    }
};


const getFacultyTimetable = async (req, res) => {
    try {
        const { facultyId } = req.params;

        const faculty = await Faculty.findById(facultyId);

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        const timetable = await Timetable.find({
            facultyId
        }).sort({
            day: 1,
            startTime: 1
        });

        res.json({
            count: timetable.length,
            timetable
        });

    } catch (error) {

        console.error("GET TIMETABLE ERROR:");
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch timetable",
            error: error.message
        });

    }
};


const deleteTimetable = async (req, res) => {
    try {
        const { id } = req.params;

        const timetable = await Timetable.findById(id);

        if (!timetable) {
            return res.status(404).json({
                message: "Timetable entry not found"
            });
        }

        await Timetable.findByIdAndDelete(id);

        res.json({
            message: "Timetable entry deleted successfully"
        });

    } catch (error) {

        console.error("DELETE TIMETABLE ERROR:");
        console.error(error);

        res.status(500).json({
            message: "Failed to delete timetable",
            error: error.message
        });

    }
};


module.exports = {
    addTimetable,
    getFacultyTimetable,
    deleteTimetable
};