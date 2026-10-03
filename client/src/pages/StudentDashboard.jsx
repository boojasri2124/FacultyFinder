import { useEffect, useState } from "react";
import "./StudentDashboard.css";

const API_URL = "https://facultyfinder-hc9s.onrender.com/api";

function StudentDashboard({ onLogout }) {

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const [facultyList, setFacultyList] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [meetings, setMeetings] = useState([]);

    const [search, setSearch] = useState("");

    const [selectedFaculty, setSelectedFaculty] =
        useState(null);

    const [requestedDate, setRequestedDate] =
        useState("");

    const [requestedTime, setRequestedTime] =
        useState("");

    const [reason, setReason] =
        useState("");

    const [meetingMessageStatus, setMeetingMessageStatus] =
        useState("");

    const [loadingMeetings, setLoadingMeetings] =
        useState(false);

    /* =========================
       GET USER ID
    ========================= */

    const getStudentId = () => {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        try {

            const userData =
                JSON.parse(storedUser);

            return (
                userData?._id ||
                userData?.id ||
                userData?.userId ||
                null
            );

        } catch (error) {

            console.error(
                "Failed to read student information:",
                error
            );

            return null;
        }
    };

    /* =========================
       FETCH FACULTY
    ========================= */

    const fetchFaculty = async () => {

        try {

            const response = await fetch(
                `${API_URL}/faculty`
            );

            const data =
                await response.json();

            if (!response.ok) {
                console.error(
                    "Failed to fetch faculty"
                );
                return;
            }

            const facultyData =
                Array.isArray(data)
                    ? data
                    : data.faculty || [];

            setFacultyList(facultyData);

        } catch (error) {

            console.error(
                "FETCH FACULTY ERROR:",
                error
            );
        }
    };

    /* =========================
       FETCH TIMETABLES
    ========================= */

    const fetchTimetables = async () => {

        try {

            const response = await fetch(
                `${API_URL}/timetable`
            );

            const data =
                await response.json();

            if (!response.ok) {
                return;
            }

            const timetableData =
                Array.isArray(data)
                    ? data
                    : data.timetables || [];

            setTimetables(timetableData);

        } catch (error) {

            console.error(
                "FETCH TIMETABLE ERROR:",
                error
            );
        }
    };

    /* =========================
       FETCH MEETINGS
    ========================= */

    const fetchMeetings = async () => {

        const studentId =
            getStudentId();

        if (!studentId) {
            return;
        }

        setLoadingMeetings(true);

        try {

            const response = await fetch(
                `${API_URL}/meetings/student/${studentId}`
            );

            const data =
                await response.json();

            if (!response.ok) {

                console.error(
                    data.message ||
                    "Failed to fetch meetings"
                );

                return;
            }

            setMeetings(
                Array.isArray(data)
                    ? data
                    : data.meetings || []
            );

        } catch (error) {

            console.error(
                "FETCH MEETINGS ERROR:",
                error
            );

        } finally {

            setLoadingMeetings(false);
        }
    };

    /* =========================
       INITIAL LOAD
    ========================= */

    useEffect(() => {

        fetchFaculty();
        fetchTimetables();
        fetchMeetings();

    }, []);

    /* =========================
       TIME HELPERS
    ========================= */

    const convertToMinutes = (time) => {

        if (!time) {
            return 0;
        }

        let value =
            time.toString().trim();

        const upper =
            value.toUpperCase();

        if (
            upper.includes("AM") ||
            upper.includes("PM")
        ) {

            const parts =
                upper.replace(
                    /\s/g,
                    ""
                );

            const isPM =
                parts.includes("PM");

            const clean =
                parts
                    .replace("AM", "")
                    .replace("PM", "");

            let [hours, minutes] =
                clean
                    .split(":")
                    .map(Number);

            if (isPM && hours !== 12) {
                hours += 12;
            }

            if (!isPM && hours === 12) {
                hours = 0;
            }

            return (
                hours * 60 +
                (minutes || 0)
            );
        }

        const [hours, minutes] =
            value
                .split(":")
                .map(Number);

        return (
            (hours || 0) * 60 +
            (minutes || 0)
        );
    };

    const formatTime = (minutes) => {

        let hours =
            Math.floor(minutes / 60);

        const mins =
            minutes % 60;

        const period =
            hours >= 12
                ? "PM"
                : "AM";

        if (hours === 0) {
            hours = 12;
        } else if (hours > 12) {
            hours -= 12;
        }

        return `${hours}:${mins
            .toString()
            .padStart(2, "0")} ${period}`;
    };

    const getDayName = (dateString) => {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(
                `${dateString}T00:00:00`
            );

        return date.toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );
    };

    /* =========================
       GET FACULTY ID
    ========================= */

    const getFacultyId = (faculty) => {

        return (
            faculty?._id ||
            faculty?.id ||
            null
        );
    };

    /* =========================
       GET FACULTY TIMETABLE
    ========================= */

    const getFacultyTimetable = (
        facultyId
    ) => {

        return timetables.filter(
            (item) => {

                const timetableFacultyId =
                    item.facultyId?._id ||
                    item.facultyId?.id ||
                    item.facultyId;

                return (
                    timetableFacultyId?.toString() ===
                    facultyId?.toString()
                );
            }
        );
    };

    /* =========================
       CURRENT CLASS
    ========================= */

    const getCurrentClass = (
        facultyId
    ) => {

        const now =
            new Date();

        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes();

        const today =
            now.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );

        const facultyTimetable =
            getFacultyTimetable(
                facultyId
            );

        return facultyTimetable.find(
            (item) => {

                const day =
                    item.day ||
                    item.dayOfWeek;

                if (
                    !day ||
                    day.toLowerCase() !==
                        today.toLowerCase()
                ) {
                    return false;
                }

                const start =
                    convertToMinutes(
                        item.startTime ||
                        item.time?.split("-")[0]
                    );

                const end =
                    convertToMinutes(
                        item.endTime ||
                        item.time?.split("-")[1]
                    );

                return (
                    currentMinutes >= start &&
                    currentMinutes < end
                );
            }
        );
    };

    /* =========================
       NEXT CLASS
    ========================= */

    const getNextClass = (
        facultyId
    ) => {

        const now =
            new Date();

        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes();

        const today =
            now.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );

        const facultyTimetable =
            getFacultyTimetable(
                facultyId
            );

        const upcoming =
            facultyTimetable
                .filter((item) => {

                    const day =
                        item.day ||
                        item.dayOfWeek;

                    if (
                        !day ||
                        day.toLowerCase() !==
                            today.toLowerCase()
                    ) {
                        return false;
                    }

                    const start =
                        convertToMinutes(
                            item.startTime ||
                            item.time?.split("-")[0]
                        );

                    return start >
                        currentMinutes;
                })
                .sort((a, b) => {

                    const aStart =
                        convertToMinutes(
                            a.startTime ||
                            a.time?.split("-")[0]
                        );

                    const bStart =
                        convertToMinutes(
                            b.startTime ||
                            b.time?.split("-")[0]
                        );

                    return aStart - bStart;
                });

        return upcoming[0] || null;
    };

    /* =========================
       SMART STATUS
    ========================= */

    const getSmartStatus = (
        faculty
    ) => {

        const currentClass =
            getCurrentClass(
                getFacultyId(faculty)
            );

        if (currentClass) {
            return "In Class";
        }

        if (
            faculty?.availabilityStatus ===
            "Available"
        ) {
            return "Available";
        }

        if (
            faculty?.availability ===
            true
        ) {
            return "Available";
        }

        if (
            faculty?.availabilityStatus ===
            "Unavailable"
        ) {
            return "Unavailable";
        }

        return "Status Unknown";
    };

    /* =========================
       SUGGESTED TIME SLOTS
    ========================= */

    const getSuggestedTimes = () => {

        if (
            !selectedFaculty ||
            !requestedDate
        ) {
            return [];
        }

        const facultyId =
            getFacultyId(
                selectedFaculty
            );

        const dayName =
            getDayName(
                requestedDate
            );

        const facultyTimetable =
            getFacultyTimetable(
                facultyId
            ).filter((item) => {

                const day =
                    item.day ||
                    item.dayOfWeek;

                return (
                    day &&
                    day.toLowerCase() ===
                        dayName.toLowerCase()
                );
            });

        const slots = [];

        for (
            let minutes = 9 * 60;
            minutes <= 17 * 60;
            minutes += 30
        ) {

            const slotStart =
                minutes;

            const slotEnd =
                minutes + 30;

            const conflict =
                facultyTimetable.some(
                    (item) => {

                        const start =
                            convertToMinutes(
                                item.startTime ||
                                item.time?.split("-")[0]
                            );

                        const end =
                            convertToMinutes(
                                item.endTime ||
                                item.time?.split("-")[1]
                            );

                        return (
                            slotStart < end &&
                            slotEnd > start
                        );
                    }
                );

            if (!conflict) {

                slots.push(
                    formatTime(minutes)
                );
            }
        }

        return slots;
    };

    const suggestedTimes =
        getSuggestedTimes();

    /* =========================
       SELECT TIME
    ========================= */

    const selectSuggestedTime = (
        time
    ) => {

        setRequestedTime(time);

        setMeetingMessageStatus("");
    };

    /* =========================
       OPEN MEETING MODAL
    ========================= */

    const openMeetingModal = (
        faculty
    ) => {

        setSelectedFaculty(
            faculty
        );

        setRequestedDate("");

        setRequestedTime("");

        setReason("");

        setMeetingMessageStatus("");
    };

    /* =========================
       CLOSE MODAL
    ========================= */

    const closeMeetingModal = () => {

        setSelectedFaculty(null);

        setRequestedDate("");

        setRequestedTime("");

        setReason("");

        setMeetingMessageStatus("");
    };

    /* =========================
       SEND MEETING REQUEST
    ========================= */

    const sendMeetingRequest = async (
        e
    ) => {

        e.preventDefault();

        const studentId =
            getStudentId();

        const facultyId =
            getFacultyId(
                selectedFaculty
            );

        if (!studentId) {

            setMeetingMessageStatus(
                "Unable to identify student."
            );

            return;
        }

        if (!facultyId) {

            setMeetingMessageStatus(
                "Faculty information is missing."
            );

            return;
        }

        if (!requestedDate) {

            setMeetingMessageStatus(
                "Please select a meeting date."
            );

            return;
        }

        if (!requestedTime) {

            setMeetingMessageStatus(
                "Please select a meeting time."
            );

            return;
        }

        if (!reason.trim()) {

            setMeetingMessageStatus(
                "Please enter the reason for the meeting."
            );

            return;
        }

        try {

            /*
             * Backend expects requestedDate.
             *
             * Combine selected date and
             * selected time into one
             * JavaScript date string.
             */

            const timeParts =
                requestedTime.match(
                    /(\d+):(\d+)\s*(AM|PM)/i
                );

            let finalDate =
                requestedDate;

            if (timeParts) {

                let hours =
                    parseInt(
                        timeParts[1],
                        10
                    );

                const minutes =
                    parseInt(
                        timeParts[2],
                        10
                    );

                const period =
                    timeParts[3].toUpperCase();

                if (
                    period === "PM" &&
                    hours !== 12
                ) {
                    hours += 12;
                }

                if (
                    period === "AM" &&
                    hours === 12
                ) {
                    hours = 0;
                }

                finalDate =
                    `${requestedDate}T${hours
                        .toString()
                        .padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}:00`;
            }

            const response =
                await fetch(
                    `${API_URL}/meetings`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            studentId:
                                studentId,

                            facultyId:
                                facultyId,

                            requestedDate:
                                finalDate,

                            message:
                                reason.trim(),

                            reason:
                                reason.trim()
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                setMeetingMessageStatus(
                    data.message ||
                    "Unable to send meeting request."
                );

                return;
            }

            setMeetingMessageStatus(
                "Meeting request sent successfully!"
            );

            await fetchMeetings();

            setTimeout(() => {
                closeMeetingModal();
            }, 900);

        } catch (error) {

            console.error(
                "SEND MEETING ERROR:",
                error
            );

            setMeetingMessageStatus(
                "Unable to connect to server."
            );
        }
    };

    /* =========================
       CANCEL MEETING
    ========================= */

    const cancelMeeting = async (
        meetingId
    ) => {

        const studentId =
            getStudentId();

        if (!studentId) {

            setMeetingMessageStatus(
                "Unable to identify student."
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this meeting?"
            );

        if (!confirmed) {
            return;
        }

        try {

            /*
             * IMPORTANT:
             *
             * Backend route:
             * PUT /api/meetings/cancel
             *
             * Backend expects:
             * {
             *   meetingId,
             *   studentId
             * }
             */

            const response =
                await fetch(
                    `${API_URL}/meetings/cancel`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            meetingId:
                                meetingId,

                            studentId:
                                studentId
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                setMeetingMessageStatus(
                    data.message ||
                    "Unable to cancel meeting."
                );

                return;
            }

            setMeetingMessageStatus(
                "Meeting request cancelled successfully."
            );

            /*
             * Update the screen immediately
             * without requiring a page refresh.
             */

            setMeetings(
                (previousMeetings) =>
                    previousMeetings.map(
                        (meeting) =>
                            meeting._id ===
                            meetingId
                                ? {
                                      ...meeting,

                                      status:
                                          "Cancelled",

                                      facultyResponse:
                                          "Meeting request cancelled by student."
                                  }
                                : meeting
                    )
            );

        } catch (error) {

            console.error(
                "CANCEL MEETING ERROR:",
                error
            );

            setMeetingMessageStatus(
                "Unable to connect to server."
            );
        }
    };

    /* =========================
       FILTER FACULTY
    ========================= */

    const filteredFaculty =
        facultyList.filter(
            (faculty) => {

                const name =
                    faculty.userId?.name ||
                    faculty.name ||
                    "";

                const email =
                    faculty.userId?.email ||
                    faculty.email ||
                    "";

                const department =
                    faculty.department ||
                    "";

                const subjects =
                    Array.isArray(
                        faculty.subjects
                    )
                        ? faculty.subjects.join(" ")
                        : faculty.subjects ||
                          "";

                const searchText =
                    `${name} ${email} ${department} ${subjects}`
                        .toLowerCase();

                return searchText.includes(
                    search.toLowerCase()
                );
            }
        );

    /* =========================
       STATUS CLASS
    ========================= */

    const getStatusClass = (
        status
    ) => {

        return status
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    /* =========================
       MEETING STATUS CLASS
    ========================= */

    const getMeetingStatusClass = (
        status
    ) => {

        return (
            status ||
            "Pending"
        )
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    /* =========================
       FORMAT MEETING DATE
    ========================= */

    const formatMeetingDate = (
        dateValue
    ) => {

        if (!dateValue) {
            return "Not specified";
        }

        const date =
            new Date(dateValue);

        if (
            isNaN(
                date.getTime()
            )
        ) {
            return "Not specified";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    /* =========================
       FORMAT MEETING TIME
    ========================= */

    const formatMeetingTime = (
        dateValue
    ) => {

        if (!dateValue) {
            return "";
        }

        const date =
            new Date(dateValue);

        if (
            isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    /* =========================
       LOGOUT
    ========================= */

    const handleLogout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        if (onLogout) {
            onLogout();
        }
    };

    return (
        <div className="student-page">

            {/* =========================
                NAVBAR
            ========================= */}

            <nav className="student-navbar">

                <div className="student-logo">

                    <div className="logo-mark">
                        F
                    </div>

                    <div>
                        <strong>
                            FacultyFinder
                        </strong>

                        <span>
                            Student Portal
                        </span>
                    </div>

                </div>

                <div className="student-nav-right">

                    <div className="student-user">

                        <div className="student-avatar">

                            {user?.name
                                ?.charAt(0)
                                .toUpperCase() ||
                                "S"}

                        </div>

                        <div className="student-user-info">

                            <strong>
                                {user?.name ||
                                    "Student"}
                            </strong>

                            <span>
                                Student
                            </span>

                        </div>

                    </div>

                    <button
                        className="student-logout"
                        onClick={
                            handleLogout
                        }
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* =========================
                MAIN
            ========================= */}

            <main className="student-container">

                {/* =========================
                    WELCOME
                ========================= */}

                <section className="student-welcome">

                    <div>

                        <span className="welcome-label">
                            STUDENT DASHBOARD
                        </span>

                        <h1>
                            Find the right faculty.
                            <br />
                            Meet at the right time.
                        </h1>

                        <p>
                            Search for faculty,
                            check their
                            availability,
                            and request a
                            meeting.
                        </p>

                    </div>

                    <div className="welcome-icon">
                        🎓
                    </div>

                </section>

                {/* =========================
                    SEARCH
                ========================= */}

                <section className="student-search">

                    <span className="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search faculty by name, department, subject..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    {search && (
                        <button
                            className="clear-search"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            ×
                        </button>
                    )}

                </section>

                {/* =========================
                    FACULTY
                ========================= */}

                <section className="faculty-section">

                    <div className="student-section-header">

                        <div>

                            <span className="section-label">
                                FACULTY
                            </span>

                            <h2>
                                Find Your Faculty
                            </h2>

                        </div>

                        <span className="result-count">
                            {filteredFaculty.length}{" "}
                            {filteredFaculty.length ===
                            1
                                ? "found"
                                : "found"}
                        </span>

                    </div>

                    {filteredFaculty.length ===
                    0 ? (

                        <div className="student-empty">

                            <div>
                                🔍
                            </div>

                            <h3>
                                No faculty found
                            </h3>

                            <p>
                                Try searching
                                with a different
                                name, department,
                                or subject.
                            </p>

                        </div>

                    ) : (

                        <div className="student-faculty-grid">

                            {filteredFaculty.map(
                                (faculty) => {

                                    const facultyId =
                                        getFacultyId(
                                            faculty
                                        );

                                    const facultyName =
                                        faculty.userId
                                            ?.name ||
                                        faculty.name ||
                                        "Faculty";

                                    const facultyEmail =
                                        faculty.userId
                                            ?.email ||
                                        faculty.email ||
                                        "";

                                    const currentClass =
                                        getCurrentClass(
                                            facultyId
                                        );

                                    const nextClass =
                                        getNextClass(
                                            facultyId
                                        );

                                    const status =
                                        currentClass
                                            ? "In Class"
                                            : getSmartStatus(
                                                  faculty
                                              );

                                    return (

                                        <div
                                            className="student-faculty-card"
                                            key={
                                                facultyId
                                            }
                                        >

                                            <div className="student-faculty-top">

                                                <div className="student-faculty-avatar">
                                                    {facultyName
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <div className="student-faculty-name">

                                                    <h3>
                                                        {
                                                            facultyName
                                                        }
                                                    </h3>

                                                    <p>
                                                        {
                                                            facultyEmail
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="faculty-divider" />

                                            <div className="student-detail">

                                                <span>
                                                    Department
                                                </span>

                                                <strong>
                                                    {faculty.department ||
                                                        "Not specified"}
                                                </strong>

                                            </div>

                                            <div className="student-detail">

                                                <span>
                                                    Subjects
                                                </span>

                                                <strong>
                                                    {Array.isArray(
                                                        faculty.subjects
                                                    )
                                                        ? faculty.subjects.join(
                                                              ", "
                                                          )
                                                        : faculty.subjects ||
                                                          "Not specified"}
                                                </strong>

                                            </div>

                                            <div className="student-status-row">

                                                <span>
                                                    Current
                                                    Status
                                                </span>

                                                <span
                                                    className={`student-status ${getStatusClass(
                                                        status
                                                    )}`}
                                                >
                                                    {status}
                                                </span>

                                            </div>

                                            {currentClass ? (

                                                <div className="current-class-box">

                                                    <span>
                                                        📚 Currently
                                                        in class
                                                    </span>

                                                    <strong>
                                                        {currentClass.subject ||
                                                            "Class"}
                                                    </strong>

                                                    <small>
                                                        {currentClass.startTime ||
                                                            currentClass.time?.split(
                                                                "-"
                                                            )[0]}{" "}
                                                        -{" "}
                                                        {currentClass.endTime ||
                                                            currentClass.time?.split(
                                                                "-"
                                                            )[1]}{" "}
                                                        • Room{" "}
                                                        {currentClass.room ||
                                                            "N/A"}
                                                    </small>

                                                </div>

                                            ) : nextClass ? (

                                                <div className="next-class-box">

                                                    <span>
                                                        ➜ Next
                                                        class
                                                    </span>

                                                    <strong>
                                                        {nextClass.subject ||
                                                            "Class"}
                                                    </strong>

                                                    <small>
                                                        {nextClass.startTime ||
                                                            nextClass.time?.split(
                                                                "-"
                                                            )[0]}{" "}
                                                        -{" "}
                                                        {nextClass.endTime ||
                                                            nextClass.time?.split(
                                                                "-"
                                                            )[1]}
                                                    </small>

                                                </div>

                                            ) : (

                                                <div className="no-class-box">

                                                    ✓ No more
                                                    classes today

                                                </div>

                                            )}

                                            <button
                                                className="student-meeting-button"
                                                onClick={() =>
                                                    openMeetingModal(
                                                        faculty
                                                    )
                                                }
                                            >
                                                Request Meeting
                                                <span>
                                                    →
                                                </span>
                                            </button>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </section>

                {/* =========================
                    MEETINGS
                ========================= */}

                <section className="meetings-section">

                    <div className="student-section-header">

                        <div>

                            <span className="section-label">
                                MEETINGS
                            </span>

                            <h2>
                                Meeting History
                            </h2>

                        </div>

                        <span className="result-count">
                            {meetings.length}{" "}
                            {meetings.length ===
                            1
                                ? "request"
                                : "requests"}
                        </span>

                    </div>

                    {meetingMessageStatus && (
                        <div className="student-alert">
                            {meetingMessageStatus}
                        </div>
                    )}

                    {loadingMeetings ? (

                        <div className="student-empty">
                            Loading meetings...
                        </div>

                    ) : meetings.length ===
                      0 ? (

                        <div className="student-empty">

                            <div>
                                📅
                            </div>

                            <h3>
                                No meeting requests
                            </h3>

                            <p>
                                Your meeting
                                requests will
                                appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="student-meetings-list">

                            {meetings.map(
                                (meeting) => {

                                    const meetingFaculty =
                                        meeting.facultyId;

                                    const facultyName =
                                        meetingFaculty
                                            ?.userId
                                            ?.name ||
                                        meetingFaculty
                                            ?.name ||
                                        meeting.facultyName ||
                                        "Faculty";

                                    const meetingStatus =
                                        meeting.status ||
                                        "Pending";

                                    return (

                                        <div
                                            className="student-meeting-card"
                                            key={
                                                meeting._id
                                            }
                                        >

                                            <div className="meeting-card-top">

                                                <div className="meeting-faculty">

                                                    <div className="meeting-avatar">
                                                        {facultyName
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                facultyName
                                                            }
                                                        </strong>

                                                        <span>
                                                            Meeting
                                                            Request
                                                        </span>

                                                    </div>

                                                </div>

                                                <span
                                                    className={`meeting-status ${getMeetingStatusClass(
                                                        meetingStatus
                                                    )}`}
                                                >
                                                    {
                                                        meetingStatus
                                                    }
                                                </span>

                                            </div>

                                            <div className="meeting-details">

                                                <div>

                                                    <span>
                                                        🕐 Meeting
                                                        Time
                                                    </span>

                                                    <strong>

                                                        {formatMeetingDate(
                                                            meeting.requestedDate
                                                        )}

                                                        {formatMeetingTime(
                                                            meeting.requestedDate
                                                        ) && (
                                                            <small>
                                                                {" "}
                                                                •{" "}
                                                                {formatMeetingTime(
                                                                    meeting.requestedDate
                                                                )}
                                                            </small>
                                                        )}

                                                    </strong>

                                                </div>

                                                <div>

                                                    <span>
                                                        📝 Reason
                                                    </span>

                                                    <strong>
                                                        {meeting.message ||
                                                            meeting.reason ||
                                                            "No reason provided"}
                                                    </strong>

                                                </div>

                                            </div>

                                            {meeting.facultyResponse && (
                                                <div className="faculty-response">

                                                    <span>
                                                        💬 Faculty
                                                        Response
                                                    </span>

                                                    <p>
                                                        {
                                                            meeting.facultyResponse
                                                        }
                                                    </p>

                                                </div>
                                            )}

                                            {meetingStatus ===
                                                "Pending" && (
                                                <button
                                                    className="cancel-meeting-button"
                                                    onClick={() =>
                                                        cancelMeeting(
                                                            meeting._id
                                                        )
                                                    }
                                                >
                                                    Cancel Meeting
                                                </button>
                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </section>

            </main>

            {/* =========================
                MEETING MODAL
            ========================= */}

            {selectedFaculty && (

                <div
                    className="student-modal-overlay"
                    onClick={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeMeetingModal();
                        }

                    }}
                >

                    <div className="student-modal">

                        <div className="student-modal-header">

                            <div>

                                <span className="modal-label">
                                    MEETING REQUEST
                                </span>

                                <h2>
                                    Meet{" "}
                                    {selectedFaculty
                                        .userId
                                        ?.name ||
                                        selectedFaculty.name ||
                                        "Faculty"}
                                </h2>

                                <p>
                                    Choose a suitable
                                    time and provide
                                    a reason.
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeMeetingModal
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                sendMeetingRequest
                            }
                        >

                            {/* DATE */}

                            <div className="modal-form-group">

                                <label>
                                    Meeting Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        requestedDate
                                    }
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split(
                                                "T"
                                            )[0]
                                    }
                                    onChange={(e) => {

                                        setRequestedDate(
                                            e.target
                                                .value
                                        );

                                        setRequestedTime(
                                            ""
                                        );

                                        setMeetingMessageStatus(
                                            ""
                                        );

                                    }}
                                    required
                                />

                            </div>

                            {/* TIME */}

                            <div className="suggested-section">

                                <div className="suggested-title">
                                    Available Time
                                    Slots
                                </div>

                                {!requestedDate ? (

                                    <div className="no-slots">
                                        Select a date
                                        to see
                                        available
                                        time slots.
                                    </div>

                                ) : suggestedTimes.length >
                                  0 ? (

                                    <div className="suggested-grid">

                                        {suggestedTimes.map(
                                            (
                                                time,
                                                index
                                            ) => (

                                                <button
                                                    type="button"
                                                    key={
                                                        index
                                                    }
                                                    className={`suggested-time ${
                                                        requestedTime ===
                                                        time
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        selectSuggestedTime(
                                                            time
                                                        )
                                                    }
                                                >
                                                    🕐{" "}
                                                    {time}
                                                </button>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <div className="no-slots">
                                        No available
                                        time slots
                                        for this
                                        date.
                                    </div>

                                )}

                            </div>

                            {/* SELECTED TIME */}

                            {requestedTime && (

                                <div className="selected-time-box">

                                    <span>
                                        Selected Meeting
                                        Time
                                    </span>

                                    <strong>
                                        ✓{" "}
                                        {
                                            requestedTime
                                        }
                                    </strong>

                                </div>

                            )}

                            {/* REASON */}

                            <div className="modal-form-group">

                                <label>
                                    Reason for Meeting
                                </label>

                                <textarea
                                    placeholder="Enter the reason for requesting the meeting..."
                                    value={
                                        reason
                                    }
                                    onChange={(e) =>
                                        setReason(
                                            e.target
                                                .value
                                        )
                                    }
                                    rows="4"
                                    required
                                />

                            </div>

                            {/* MESSAGE */}

                            {meetingMessageStatus && (

                                <div className="modal-message">

                                    {meetingMessageStatus}

                                </div>

                            )}

                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="modal-cancel-button"
                                    onClick={
                                        closeMeetingModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="send-request-button"
                                    disabled={
                                        !requestedDate ||
                                        !requestedTime ||
                                        !reason.trim()
                                    }
                                >
                                    Send Request
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default StudentDashboard;