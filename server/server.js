const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const PORT = 5000;

const MONGO_URI =
    "mongodb://127.0.0.1:27017/FacultyFinder";

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

const facultyRoutes =
    require("./routes/facultyRoutes");

const meetingRoutes =
    require("./routes/meetingRoutes");

const timetableRoutes =
    require("./routes/timetableRoutes");

const authRoutes =
    require("./routes/authRoutes");

app.use(
    "/api/faculty",
    facultyRoutes
);

app.use(
    "/api/meetings",
    meetingRoutes
);

app.use(
    "/api/timetable",
    timetableRoutes
);

app.use(
    "/api/auth",
    authRoutes
);

app.get(
    "/",
    (req, res) => {
        res.json({
            message:
                "FacultyFinder API is running"
        });
    }
);

app.get(
    "/api/test",
    (req, res) => {
        res.json({
            message:
                "Backend connection successful"
        });
    }
);

app.use(
    (req, res) => {
        res.status(404).json({
            message:
                "API route not found",
            path: req.originalUrl
        });
    }
);

app.use(
    (err, req, res, next) => {
        console.error(
            "SERVER ERROR:"
        );

        console.error(err);

        res.status(500).json({
            message:
                "Internal server error",
            error:
                err.message
        });
    }
);

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log(
            "MongoDB connected successfully"
        );

        app.listen(
            PORT,
            () => {
                console.log(
                    `Server running on http://localhost:${PORT}`
                );
            }
        );
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:"
        );

        console.error(error);
    });