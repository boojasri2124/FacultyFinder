import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard({ onLogout }) {
    const [faculty, setFaculty] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [department, setDepartment] = useState("");
    const [designation, setDesignation] = useState("");
    const [subjects, setSubjects] = useState("");
    const [office, setOffice] = useState("");
    const [room, setRoom] = useState("");
    const [campusZone, setCampusZone] = useState("Other");

    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [day, setDay] = useState("Monday");
    const [subject, setSubject] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [timetableRoom, setTimetableRoom] = useState("");

    const [timetable, setTimetable] = useState([]);
    const [message, setMessage] = useState("");

    const fetchFaculty = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/faculty"
            );

            const data = await response.json();

            if (response.ok) {
                setFaculty(data.faculty);
            }
        } catch (error) {
            console.error("Failed to fetch faculty:", error);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleAddFaculty = async (e) => {
        e.preventDefault();

        setMessage("Adding faculty...");

        try {
            const response = await fetch(
                "http://localhost:5000/api/faculty",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        facultyId,
                        department,
                        designation,
                        subjects: subjects
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        office,
                        room,
                        campusZone
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to add faculty");
                return;
            }

            setMessage("Faculty added successfully");

            setName("");
            setEmail("");
            setPassword("");
            setFacultyId("");
            setDepartment("");
            setDesignation("");
            setSubjects("");
            setOffice("");
            setRoom("");
            setCampusZone("Other");

            setShowForm(false);

            fetchFaculty();
        } catch (error) {
            setMessage("Unable to connect to server");
        }
    };

    const fetchTimetable = async (facultyDatabaseId) => {
        if (!facultyDatabaseId) {
            setTimetable([]);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/timetable/faculty/${facultyDatabaseId}`
            );

            const data = await response.json();

            if (response.ok) {
                setTimetable(data.timetable);
            }
        } catch (error) {
            console.error("Failed to fetch timetable:", error);
        }
    };

    const handleFacultySelection = (e) => {
        const id = e.target.value;

        setSelectedFaculty(id);

        fetchTimetable(id);
    };

    const handleAddTimetable = async (e) => {
        e.preventDefault();

        if (!selectedFaculty) {
            setMessage("Please select a faculty member");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/timetable",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        facultyId: selectedFaculty,
                        day,
                        subject,
                        startTime,
                        endTime,
                        room: timetableRoom
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to add timetable"
                );
                return;
            }

            setMessage("Timetable added successfully");

            setSubject("");
            setStartTime("");
            setEndTime("");
            setTimetableRoom("");

            fetchTimetable(selectedFaculty);
        } catch (error) {
            setMessage("Unable to connect to server");
        }
    };

    const handleDeleteTimetable = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/timetable/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to delete timetable"
                );
                return;
            }

            setMessage("Timetable entry deleted");

            fetchTimetable(selectedFaculty);
        } catch (error) {
            setMessage("Unable to connect to server");
        }
    };

    const totalFaculty = faculty.length;

    const departments = [
        ...new Set(
            faculty.map((item) => item.department)
        )
    ];

    const campusZones = [
        ...new Set(
            faculty.map((item) => item.campusZone)
        )
    ];

    return (
        <div className="admin-page">

            <nav className="admin-navbar">

                <div className="admin-logo">
                    <div className="logo-icon">F</div>

                    <div>
                        <h2>FacultyFinder</h2>
                        <span>Administration</span>
                    </div>
                </div>

                <div className="admin-nav-right">

                    <div className="admin-profile">
                        <div className="admin-avatar">
                            A
                        </div>

                        <div>
                            <strong>Administrator</strong>
                            <span>Admin</span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={onLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            <main className="admin-container">

                <section className="admin-header">

                    <div>

                        <span className="admin-label">
                            ADMIN DASHBOARD
                        </span>

                        <h1>
                            Manage FacultyFinder
                        </h1>

                        <p>
                            Manage faculty members, campus information
                            and faculty timetables from one place.
                        </p>

                    </div>

                </section>


                <section className="admin-stats">

                    <div className="stat-card">

                        <div className="stat-icon">
                            👨‍🏫
                        </div>

                        <div>
                            <span>Total Faculty</span>
                            <h2>{totalFaculty}</h2>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            🏢
                        </div>

                        <div>
                            <span>Departments</span>
                            <h2>{departments.length}</h2>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            📍
                        </div>

                        <div>
                            <span>Campus Zones</span>
                            <h2>{campusZones.length}</h2>
                        </div>

                    </div>

                </section>


                <section className="admin-section">

                    <div className="section-header">

                        <div>
                            <h2>Faculty Management</h2>

                            <p>
                                Add and manage faculty members.
                            </p>
                        </div>

                        <button
                            className="primary-button"
                            onClick={() =>
                                setShowForm(!showForm)
                            }
                        >
                            {showForm
                                ? "Close Form"
                                : "+ Add Faculty"}
                        </button>

                    </div>


                    {showForm && (

                        <form
                            className="faculty-form"
                            onSubmit={handleAddFaculty}
                        >

                            <div className="form-title">
                                <h3>Add New Faculty</h3>

                                <p>
                                    Enter the faculty member's details below.
                                </p>
                            </div>

                            <div className="form-grid">

                                <div className="form-group">
                                    <label>Faculty Name</label>

                                    <input
                                        type="text"
                                        placeholder="Enter faculty name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Email</label>

                                    <input
                                        type="email"
                                        placeholder="faculty@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Password</label>

                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Faculty ID</label>

                                    <input
                                        type="text"
                                        placeholder="Example: CSE001"
                                        value={facultyId}
                                        onChange={(e) =>
                                            setFacultyId(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Department</label>

                                    <input
                                        type="text"
                                        placeholder="Computer Science and Engineering"
                                        value={department}
                                        onChange={(e) =>
                                            setDepartment(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Designation</label>

                                    <input
                                        type="text"
                                        placeholder="Assistant Professor"
                                        value={designation}
                                        onChange={(e) =>
                                            setDesignation(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="form-group full-width">
                                    <label>Subjects</label>

                                    <input
                                        type="text"
                                        placeholder="DBMS, Computer Networks"
                                        value={subjects}
                                        onChange={(e) =>
                                            setSubjects(e.target.value)
                                        }
                                    />

                                    <small>
                                        Separate multiple subjects using commas.
                                    </small>
                                </div>


                                <div className="form-group">
                                    <label>Office</label>

                                    <input
                                        type="text"
                                        placeholder="Staff Room"
                                        value={office}
                                        onChange={(e) =>
                                            setOffice(e.target.value)
                                        }
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Room</label>

                                    <input
                                        type="text"
                                        placeholder="Room 204"
                                        value={room}
                                        onChange={(e) =>
                                            setRoom(e.target.value)
                                        }
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Campus Zone</label>

                                    <select
                                        value={campusZone}
                                        onChange={(e) =>
                                            setCampusZone(e.target.value)
                                        }
                                    >
                                        <option>CSE Block</option>
                                        <option>ECE Block</option>
                                        <option>Main Block</option>
                                        <option>Library</option>
                                        <option>Seminar Hall</option>
                                        <option>Lab Block</option>
                                        <option>Staff Room</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                            </div>


                            <button
                                className="submit-button"
                                type="submit"
                            >
                                Add Faculty
                            </button>

                        </form>

                    )}

                </section>


                <section className="admin-section">

                    <div className="section-header">

                        <div>
                            <h2>Timetable Management</h2>

                            <p>
                                Create and manage faculty class schedules.
                            </p>
                        </div>

                        <span className="count-badge">
                            {timetable.length} entries
                        </span>

                    </div>


                    <div className="selector-container">

                        <label>Select Faculty</label>

                        <select
                            value={selectedFaculty}
                            onChange={handleFacultySelection}
                        >

                            <option value="">
                                Select a faculty member
                            </option>

                            {faculty.map((member) => (

                                <option
                                    key={member._id}
                                    value={member._id}
                                >
                                    {member.userId?.name}
                                </option>

                            ))}

                        </select>

                    </div>


                    {selectedFaculty && (

                        <>

                            <form
                                className="timetable-form"
                                onSubmit={handleAddTimetable}
                            >

                                <div className="form-group">
                                    <label>Day</label>

                                    <select
                                        value={day}
                                        onChange={(e) =>
                                            setDay(e.target.value)
                                        }
                                    >
                                        <option>Monday</option>
                                        <option>Tuesday</option>
                                        <option>Wednesday</option>
                                        <option>Thursday</option>
                                        <option>Friday</option>
                                        <option>Saturday</option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Subject</label>

                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        value={subject}
                                        onChange={(e) =>
                                            setSubject(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Start Time</label>

                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>End Time</label>

                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) =>
                                            setEndTime(e.target.value)
                                        }
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Room</label>

                                    <input
                                        type="text"
                                        placeholder="Room 204"
                                        value={timetableRoom}
                                        onChange={(e) =>
                                            setTimetableRoom(e.target.value)
                                        }
                                    />
                                </div>


                                <button
                                    className="submit-button"
                                    type="submit"
                                >
                                    Add Timetable
                                </button>

                            </form>


                            <div className="timetable-list">

                                {timetable.length === 0 ? (

                                    <div className="empty-state">

                                        <div className="empty-icon">
                                            📅
                                        </div>

                                        <h3>
                                            No timetable entries
                                        </h3>

                                        <p>
                                            Add the faculty's class
                                            schedule above.
                                        </p>

                                    </div>

                                ) : (

                                    timetable.map((entry) => (

                                        <div
                                            className="timetable-card"
                                            key={entry._id}
                                        >

                                            <div className="timetable-info">

                                                <span className="day-badge">
                                                    {entry.day}
                                                </span>

                                                <h3>
                                                    {entry.subject}
                                                </h3>

                                                <p>
                                                    🕐 {entry.startTime}
                                                    {" - "}
                                                    {entry.endTime}
                                                </p>

                                                {entry.room && (
                                                    <p>
                                                        📍 Room: {entry.room}
                                                    </p>
                                                )}

                                            </div>


                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    handleDeleteTimetable(
                                                        entry._id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    ))

                                )}

                            </div>

                        </>

                    )}

                </section>


                <section className="admin-section">

                    <div className="section-header">

                        <div>
                            <h2>Faculty List</h2>

                            <p>
                                View all registered faculty members.
                            </p>
                        </div>

                        <span className="count-badge">
                            {faculty.length} faculty
                        </span>

                    </div>


                    <div className="faculty-grid">

                        {faculty.map((member) => (

                            <div
                                className="faculty-card"
                                key={member._id}
                            >

                                <div className="faculty-card-top">

                                    <div className="faculty-avatar">
                                        {member.userId?.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                    </div>

                                    <div className="faculty-title">

                                        <h3>
                                            {member.userId?.name}
                                        </h3>

                                        <span>
                                            {member.facultyId}
                                        </span>

                                    </div>

                                </div>


                                <div className="faculty-details">

                                    <div>
                                        <span>Department</span>
                                        <strong>
                                            {member.department}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Subjects</span>
                                        <strong>
                                            {member.subjects?.join(", ")}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Location</span>
                                        <strong>
                                            {member.campusZone}
                                        </strong>
                                    </div>

                                </div>


                                <div className="faculty-status">

                                    <span
                                        className={`status-dot ${
                                            member.availabilityStatus ===
                                            "Available"
                                                ? "available"
                                                : member.availabilityStatus ===
                                                  "Busy"
                                                ? "busy"
                                                : member.availabilityStatus ===
                                                  "In Class"
                                                ? "in-class"
                                                : "unknown"
                                        }`}
                                    ></span>

                                    <span>
                                        {member.availabilityStatus ||
                                            "Status Unknown"}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>


                {message && (

                    <div className="admin-message">
                        {message}
                    </div>

                )}

            </main>

        </div>
    );
}

export default AdminDashboard;