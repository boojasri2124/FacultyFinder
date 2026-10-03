import { useEffect, useState } from "react";
import "./FacultyDashboard.css";

function FacultyDashboard({ onLogout }) {
    const [faculty, setFaculty] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [showAvailability, setShowAvailability] = useState(false);
    const [showLocation, setShowLocation] = useState(false);

    const [availability, setAvailability] = useState("Available");
    const [locationSharing, setLocationSharing] = useState(false);
    const [campusZone, setCampusZone] = useState("");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const API_URL = "http://localhost:5000/api";

    /* =========================================
       USER ID
    ========================================= */

    const getUserId = () => {
        return (
            user?._id ||
            user?.id ||
            user?.userId ||
            null
        );
    };

    /* =========================================
       FACULTY ID
    ========================================= */

    const getFacultyId = () => {
        return (
            faculty?._id ||
            faculty?.id ||
            null
        );
    };

    /* =========================================
       FORMAT MEETING DATE
    ========================================= */

    const formatMeetingDateTime = (date) => {
        if (!date) {
            return "Date and time not available";
        }

        const meetingDate = new Date(date);

        if (isNaN(meetingDate.getTime())) {
            return "Invalid date";
        }

        return meetingDate.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    /* =========================================
       AVAILABILITY CLASS
    ========================================= */

    const getAvailabilityClass = (status) => {
        switch (status) {
            case "Available":
                return "status-available";

            case "Busy":
                return "status-busy";

            case "In Class":
                return "status-in-class";

            case "Not Available":
                return "status-not-available";

            case "On Leave":
                return "status-on-leave";

            default:
                return "status-not-available";
        }
    };

    /* =========================================
       AVAILABILITY ICON
    ========================================= */

    const getAvailabilityIcon = (status) => {
        switch (status) {
            case "Available":
                return "🟢";

            case "Busy":
                return "🔴";

            case "In Class":
                return "🟠";

            case "Not Available":
                return "⚪";

            case "On Leave":
                return "🟣";

            default:
                return "⚪";
        }
    };

    /* =========================================
       LOAD FACULTY
    ========================================= */

    const loadFaculty = async () => {
        try {
            const response = await fetch(
                `${API_URL}/faculty`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to load faculty"
                );
                return;
            }

            const facultyList = Array.isArray(data)
                ? data
                : data.faculty || [];

            const currentFaculty = facultyList.find(
                (item) =>
                    item.userId?._id === user?._id ||
                    item.userId?._id === user?.id ||
                    item.userId?.email === user?.email
            );

            if (!currentFaculty) {
                setMessage("Faculty profile not found");
                return;
            }

            setFaculty(currentFaculty);

            setAvailability(
                currentFaculty.availabilityStatus ||
                currentFaculty.availability ||
                "Available"
            );

            setLocationSharing(
                currentFaculty.locationSharing ??
                false
            );

            setCampusZone(
                currentFaculty.campusZone ||
                ""
            );

        } catch (error) {
            console.error(
                "Faculty loading error:",
                error
            );

            setMessage(
                "Unable to connect to server"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       LOAD MEETINGS
    ========================================= */

    const loadMeetings = async () => {
        const facultyId = getFacultyId();

        if (!facultyId) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/meetings/faculty/${facultyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "Meeting error:",
                    data.message
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
                "Meeting loading error:",
                error
            );
        }
    };

    /* =========================================
       LOAD TIMETABLE
    ========================================= */

    const loadTimetable = async () => {
        const facultyId = getFacultyId();

        if (!facultyId) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/timetable/faculty/${facultyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "Timetable error:",
                    data.message
                );
                return;
            }

            setTimetable(
                Array.isArray(data)
                    ? data
                    : data.timetable || []
            );

        } catch (error) {
            console.error(
                "Timetable loading error:",
                error
            );
        }
    };

    /* =========================================
       INITIAL LOAD
    ========================================= */

    useEffect(() => {
        loadFaculty();
    }, []);

    /* =========================================
       LOAD MEETINGS + TIMETABLE
    ========================================= */

    useEffect(() => {
        if (faculty) {
            loadMeetings();
            loadTimetable();
        }
    }, [faculty]);

    /* =========================================
       UPDATE AVAILABILITY
    ========================================= */

    const handleAvailability = async () => {
        const userId = getUserId();

        if (!userId) {
            setMessage("User ID not found");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/faculty/availability`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userId: userId,
                        availabilityStatus:
                            availability,
                        availableUntil: null
                    })
                }
            );

            const data = await response.json();

            console.log(
                "Availability response:",
                data
            );

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to update availability"
                );
                return;
            }

            setFaculty((prev) => ({
                ...prev,
                availabilityStatus:
                    availability
            }));

            setShowAvailability(false);

            setMessage(
                "Availability updated successfully"
            );

        } catch (error) {
            console.error(
                "Availability error:",
                error
            );

            setMessage(
                "Unable to connect to server"
            );
        }
    };

    /* =========================================
       UPDATE LOCATION
    ========================================= */

    const handleLocation = async () => {
        const userId = getUserId();

        if (!userId) {
            setMessage("User ID not found");
            return;
        }

        if (!campusZone) {
            setMessage(
                "Please select a campus location"
            );
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/faculty/location`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userId: userId,
                        campusZone: campusZone,
                        locationSharing:
                            locationSharing
                    })
                }
            );

            const data = await response.json();

            console.log(
                "Location response:",
                data
            );

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to update location"
                );
                return;
            }

            setFaculty((prev) => ({
                ...prev,
                campusZone: campusZone,
                locationSharing:
                    locationSharing
            }));

            setShowLocation(false);

            setMessage(
                "Campus location updated successfully"
            );

        } catch (error) {
            console.error(
                "Location error:",
                error
            );

            setMessage(
                "Unable to connect to server"
            );
        }
    };

    /* =========================================
       UPDATE MEETING STATUS
    ========================================= */

    const updateMeetingStatus = async (
        meetingId,
        status
    ) => {
        try {
            const response = await fetch(
                `${API_URL}/meetings/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        meetingId: meetingId,
                        status: status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to update meeting"
                );
                return;
            }

            setMessage(
                `Meeting ${status.toLowerCase()} successfully`
            );

            await loadMeetings();

        } catch (error) {
            console.error(
                "Meeting update error:",
                error
            );

            setMessage(
                "Unable to update meeting"
            );
        }
    };

    /* =========================================
       LOGOUT
    ========================================= */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (onLogout) {
            onLogout();
        }
    };

    /* =========================================
       LOADING
    ========================================= */

    if (loading) {
        return (
            <div className="dashboard-loading">

                <div className="loading-card">

                    <h2>
                        Loading Faculty Dashboard...
                    </h2>

                    <p>
                        Please wait...
                    </p>

                </div>

            </div>
        );
    }

    const currentStatus =
        faculty?.availabilityStatus ||
        faculty?.availability ||
        availability ||
        "Available";

    return (
        <div className="faculty-dashboard">

            {/* =====================================
                NAVBAR
            ===================================== */}

            <nav className="dashboard-navbar">

                <div className="navbar-brand">

                    <h1>
                        FacultyFinder
                    </h1>

                </div>


                <div className="navbar-right">

                    <span className="faculty-role">
                        Faculty
                    </span>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* =====================================
                MAIN
            ===================================== */}

            <main className="dashboard-container">

                {/* =================================
                    WELCOME
                ================================= */}

                <section className="welcome-section">

                    <div>

                        <p className="welcome-small">
                            Faculty Dashboard
                        </p>

                        <h2>
                            Welcome,{" "}
                            {faculty?.userId?.name ||
                                user?.name ||
                                "Faculty"}{" "}
                            👋
                        </h2>

                        <p>
                            Manage your availability,
                            location, timetable and
                            student meeting requests.
                        </p>

                    </div>


                    <div
                        className={`availability-badge ${getAvailabilityClass(
                            currentStatus
                        )}`}
                    >

                        <span className="status-dot"></span>

                        {currentStatus}

                    </div>

                </section>


                {/* =================================
                    MESSAGE
                ================================= */}

                {message && (

                    <div className="dashboard-message">

                        <span>
                            {message}
                        </span>

                        <button
                            onClick={() =>
                                setMessage("")
                            }
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* =================================
                    STATS
                ================================= */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon">
                            📩
                        </div>

                        <div>

                            <span>
                                Meeting Requests
                            </span>

                            <strong>
                                {
                                    meetings.filter(
                                        (meeting) =>
                                            meeting.status ===
                                            "Pending"
                                    ).length
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            📚
                        </div>

                        <div>

                            <span>
                                Timetable Classes
                            </span>

                            <strong>
                                {timetable.length}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            📍
                        </div>

                        <div>

                            <span>
                                Campus Location
                            </span>

                            <strong>
                                {locationSharing
                                    ? campusZone ||
                                      "Shared"
                                    : "Private"}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            {getAvailabilityIcon(
                                currentStatus
                            )}
                        </div>

                        <div>

                            <span>
                                Current Status
                            </span>

                            <strong>
                                {currentStatus}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    PROFILE + SETTINGS
                ================================= */}

                <section className="dashboard-grid">

                    {/* PROFILE */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <div>

                                <h2>
                                    My Profile
                                </h2>

                                <p>
                                    Your faculty information
                                </p>

                            </div>

                        </div>


                        <div className="profile-content">

                            <div className="profile-avatar">

                                {(
                                    faculty?.userId?.name ||
                                    user?.name ||
                                    "F"
                                )
                                    .charAt(0)
                                    .toUpperCase()}

                            </div>


                            <div className="profile-details">

                                <h3>
                                    {faculty?.userId?.name ||
                                        user?.name ||
                                        "Faculty"}
                                </h3>

                                <p>
                                    {faculty?.userId?.email ||
                                        user?.email ||
                                        "Email not available"}
                                </p>


                                <div className="profile-info">

                                    <span>

                                        <strong>
                                            Department
                                        </strong>

                                        {faculty?.department ||
                                            "Computer Science and Engineering"}

                                    </span>


                                    <span>

                                        <strong>
                                            Subjects
                                        </strong>

                                        {Array.isArray(
                                            faculty?.subjects
                                        )
                                            ? faculty.subjects.join(
                                                  ", "
                                              )
                                            : faculty?.subjects ||
                                              "Not specified"}

                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* SETTINGS */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <div>

                                <h2>
                                    Quick Settings
                                </h2>

                                <p>
                                    Manage your current
                                    status and location
                                </p>

                            </div>

                        </div>


                        <div className="settings-buttons">

                            {/* AVAILABILITY BUTTON */}

                            <button
                                className="setting-btn"
                                onClick={() =>
                                    setShowAvailability(
                                        true
                                    )
                                }
                            >

                                <span className="setting-icon">

                                    {getAvailabilityIcon(
                                        currentStatus
                                    )}

                                </span>


                                <div>

                                    <strong>
                                        Update Availability
                                    </strong>

                                    <small>
                                        {currentStatus}
                                    </small>

                                </div>


                                <span className="arrow">
                                    →
                                </span>

                            </button>


                            {/* LOCATION BUTTON */}

                            <button
                                className="setting-btn"
                                onClick={() =>
                                    setShowLocation(true)
                                }
                            >

                                <span className="setting-icon">
                                    📍
                                </span>


                                <div>

                                    <strong>
                                        Campus Location
                                    </strong>

                                    <small>
                                        {locationSharing
                                            ? campusZone ||
                                              "Location shared"
                                            : "Location private"}
                                    </small>

                                </div>


                                <span className="arrow">
                                    →
                                </span>

                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================
                    TIMETABLE
                ================================= */}

                <section className="dashboard-card timetable-section">

                    <div className="card-header">

                        <div>

                            <h2>
                                My Timetable
                            </h2>

                            <p>
                                Your scheduled classes
                            </p>

                        </div>

                    </div>


                    {timetable.length === 0 ? (

                        <div className="empty-state">

                            <div>
                                📚
                            </div>

                            <h3>
                                No timetable available
                            </h3>

                            <p>
                                Your timetable has not
                                been added yet.
                            </p>

                        </div>

                    ) : (

                        <div className="timetable-list">

                            {timetable.map(
                                (item, index) => (

                                    <div
                                        className="timetable-item"
                                        key={
                                            item._id ||
                                            index
                                        }
                                    >

                                        <div className="timetable-day">

                                            {item.day ||
                                                "Day"}

                                        </div>


                                        <div className="timetable-details">

                                            <h3>
                                                {item.subject ||
                                                    "Class"}
                                            </h3>

                                            <p>
                                                ⏰{" "}
                                                {item.startTime ||
                                                    item.time ||
                                                    "--"}

                                                {item.endTime
                                                    ? ` - ${item.endTime}`
                                                    : ""}
                                            </p>

                                            <p>
                                                📍{" "}
                                                {item.room ||
                                                    "Room not specified"}
                                            </p>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================
                    MEETINGS
                ================================= */}

                <section className="dashboard-card meetings-section">

                    <div className="card-header">

                        <div>

                            <h2>
                                Student Meeting Requests
                            </h2>

                            <p>
                                Review and manage
                                meeting requests
                            </p>

                        </div>


                        <span className="request-count">

                            {meetings.length}

                            {" "}
                            request
                            {meetings.length !== 1
                                ? "s"
                                : ""}

                        </span>

                    </div>


                    {meetings.length === 0 ? (

                        <div className="empty-state">

                            <div>
                                📭
                            </div>

                            <h3>
                                No meeting requests
                            </h3>

                            <p>
                                New student requests
                                will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="meeting-list">

                            {meetings.map(
                                (meeting) => {

                                    const studentName =
                                        meeting.studentId
                                            ?.name ||
                                        "Student";

                                    const studentEmail =
                                        meeting.studentId
                                            ?.email ||
                                        "Email not available";

                                    return (

                                        <div
                                            className="meeting-card"
                                            key={
                                                meeting._id
                                            }
                                        >

                                            <div className="meeting-top">

                                                <div className="student-avatar">

                                                    {studentName
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </div>


                                                <div className="student-info">

                                                    <h3>
                                                        {
                                                            studentName
                                                        }
                                                    </h3>

                                                    <p>
                                                        {
                                                            studentEmail
                                                        }
                                                    </p>

                                                </div>


                                                <span
                                                    className={`meeting-status ${String(
                                                        meeting.status ||
                                                            "Pending"
                                                    )
                                                        .toLowerCase()
                                                        .replace(
                                                            " ",
                                                            "-"
                                                        )}`}
                                                >
                                                    {meeting.status ||
                                                        "Pending"}
                                                </span>

                                            </div>


                                            <div className="meeting-meta">

                                                <span>
                                                    📅{" "}
                                                    {formatMeetingDateTime(
                                                        meeting.requestedDate
                                                    )}
                                                </span>


                                                {meeting.message && (

                                                    <span>
                                                        💬{" "}
                                                        {
                                                            meeting.message
                                                        }
                                                    </span>

                                                )}

                                            </div>


                                            {meeting.status ===
                                                "Pending" && (

                                                <div className="meeting-actions">

                                                    <button
                                                        className="accept-btn"
                                                        onClick={() =>
                                                            updateMeetingStatus(
                                                                meeting._id,
                                                                "Accepted"
                                                            )
                                                        }
                                                    >
                                                        ✓ Accept
                                                    </button>


                                                    <button
                                                        className="reject-btn"
                                                        onClick={() =>
                                                            updateMeetingStatus(
                                                                meeting._id,
                                                                "Rejected"
                                                            )
                                                        }
                                                    >
                                                        ✕ Reject
                                                    </button>

                                                </div>

                                            )}


                                            {meeting.status ===
                                                "Accepted" && (

                                                <div className="meeting-result accepted-result">
                                                    ✓ Meeting accepted
                                                </div>

                                            )}


                                            {meeting.status ===
                                                "Rejected" && (

                                                <div className="meeting-result rejected-result">
                                                    ✕ Meeting rejected
                                                </div>

                                            )}

                                        </div>

                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

            </main>


            {/* =================================================
                AVAILABILITY MODAL
            ================================================= */}

            {showAvailability && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowAvailability(false)
                    }
                >

                    <div
                        className="modal-card availability-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="modal-close"
                            onClick={() =>
                                setShowAvailability(false)
                            }
                        >
                            ×
                        </button>


                        <div className="modal-header">

                            <div className="modal-icon">

                                {getAvailabilityIcon(
                                    availability
                                )}

                            </div>


                            <div>

                                <h2>
                                    Update Availability
                                </h2>

                                <p>
                                    Choose your current
                                    availability status.
                                </p>

                            </div>

                        </div>


                        <div className="availability-options">

                            {/* AVAILABLE */}

                            <label
                                className={`availability-option ${
                                    availability ===
                                    "Available"
                                        ? "selected"
                                        : ""
                                }`}
                            >

                                <input
                                    type="radio"
                                    name="availability"
                                    value="Available"
                                    checked={
                                        availability ===
                                        "Available"
                                    }
                                    onChange={(e) =>
                                        setAvailability(
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="option-indicator available-indicator">
                                    ●
                                </span>

                                <div className="option-content">

                                    <strong>
                                        Available
                                    </strong>

                                    <p>
                                        Students can request
                                        a meeting with you.
                                    </p>

                                </div>

                            </label>


                            {/* BUSY */}

                            <label
                                className={`availability-option ${
                                    availability ===
                                    "Busy"
                                        ? "selected"
                                        : ""
                                }`}
                            >

                                <input
                                    type="radio"
                                    name="availability"
                                    value="Busy"
                                    checked={
                                        availability ===
                                        "Busy"
                                    }
                                    onChange={(e) =>
                                        setAvailability(
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="option-indicator busy-indicator">
                                    ●
                                </span>

                                <div className="option-content">

                                    <strong>
                                        Busy
                                    </strong>

                                    <p>
                                        You are currently
                                        occupied.
                                    </p>

                                </div>

                            </label>


                            {/* IN CLASS */}

                            <label
                                className={`availability-option ${
                                    availability ===
                                    "In Class"
                                        ? "selected"
                                        : ""
                                }`}
                            >

                                <input
                                    type="radio"
                                    name="availability"
                                    value="In Class"
                                    checked={
                                        availability ===
                                        "In Class"
                                    }
                                    onChange={(e) =>
                                        setAvailability(
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="option-indicator class-indicator">
                                    ●
                                </span>

                                <div className="option-content">

                                    <strong>
                                        In Class
                                    </strong>

                                    <p>
                                        You are currently
                                        taking a class.
                                    </p>

                                </div>

                            </label>


                            {/* NOT AVAILABLE */}

                            <label
                                className={`availability-option ${
                                    availability ===
                                    "Not Available"
                                        ? "selected"
                                        : ""
                                }`}
                            >

                                <input
                                    type="radio"
                                    name="availability"
                                    value="Not Available"
                                    checked={
                                        availability ===
                                        "Not Available"
                                    }
                                    onChange={(e) =>
                                        setAvailability(
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="option-indicator unavailable-indicator">
                                    ●
                                </span>

                                <div className="option-content">

                                    <strong>
                                        Not Available
                                    </strong>

                                    <p>
                                        Students cannot
                                        request meetings
                                        right now.
                                    </p>

                                </div>

                            </label>


                            {/* ON LEAVE */}

                            <label
                                className={`availability-option ${
                                    availability ===
                                    "On Leave"
                                        ? "selected"
                                        : ""
                                }`}
                            >

                                <input
                                    type="radio"
                                    name="availability"
                                    value="On Leave"
                                    checked={
                                        availability ===
                                        "On Leave"
                                    }
                                    onChange={(e) =>
                                        setAvailability(
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="option-indicator leave-indicator">
                                    ●
                                </span>

                                <div className="option-content">

                                    <strong>
                                        On Leave
                                    </strong>

                                    <p>
                                        You are unavailable
                                        for the day.
                                    </p>

                                </div>

                            </label>

                        </div>


                        <div className="modal-actions">

                            <button
                                className="cancel-btn"
                                onClick={() =>
                                    setShowAvailability(false)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                className="save-btn"
                                onClick={
                                    handleAvailability
                                }
                            >
                                Save Availability
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                LOCATION MODAL
            ================================================= */}

            {showLocation && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowLocation(false)
                    }
                >

                    <div
                        className="modal-card"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="modal-close"
                            onClick={() =>
                                setShowLocation(false)
                            }
                        >
                            ×
                        </button>


                        <div className="modal-header">

                            <div className="modal-icon">
                                📍
                            </div>


                            <div>

                                <h2>
                                    Campus Location
                                </h2>

                                <p>
                                    Choose your current
                                    location on campus.
                                </p>

                            </div>

                        </div>


                        <div className="location-form">

                            <label>
                                Campus Zone
                            </label>


                            <select
                                value={campusZone}
                                onChange={(e) =>
                                    setCampusZone(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select campus location
                                </option>

                                <option value="Seminar Hall">
                                    Seminar Hall
                                </option>

                                <option value="Computer Science Block">
                                    Computer Science Block
                                </option>

                                <option value="Main Block">
                                    Main Block
                                </option>

                                <option value="Library">
                                    Library
                                </option>

                                <option value="Canteen">
                                    Canteen
                                </option>

                                <option value="Staff Room">
                                    Staff Room
                                </option>

                                <option value="Faculty Room">
                                    Faculty Room
                                </option>

                                <option value="Department Office">
                                    Department Office
                                </option>

                                <option value="Laboratory">
                                    Laboratory
                                </option>

                                <option value="Auditorium">
                                    Auditorium
                                </option>

                                <option value="Admin Block">
                                    Admin Block
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>


                            <label className="location-toggle">

                                <input
                                    type="checkbox"
                                    checked={
                                        locationSharing
                                    }
                                    onChange={(e) =>
                                        setLocationSharing(
                                            e.target.checked
                                        )
                                    }
                                />

                                <div>

                                    <strong>
                                        Share my location
                                    </strong>

                                    <p>
                                        Students can see
                                        your campus
                                        location.
                                    </p>

                                </div>

                            </label>

                        </div>


                        <div className="modal-actions">

                            <button
                                className="cancel-btn"
                                onClick={() =>
                                    setShowLocation(false)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                className="save-btn"
                                onClick={handleLocation}
                            >
                                Save Location
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default FacultyDashboard;