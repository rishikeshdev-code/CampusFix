const isLocalServer =
    (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1") &&
    window.location.port === "5000";

const API_BASE_URL = isLocalServer
    ? ""
    : "https://campusfix-backend-figy.onrender.com";
document.addEventListener("DOMContentLoaded", () => {

    loadModeratorComplaints();

    const logoutButton =
        document.getElementById("logoutBtn");

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            localStorage.removeItem("campusfixUser");
            localStorage.removeItem("campusfixToken");

            window.location.href = "login.html";

        });

    }

});


/*
    Load all complaints for the moderator.
*/
async function loadModeratorComplaints() {

    const container =
        document.getElementById("complaintsContainer");

    const token =
        localStorage.getItem("campusfixToken");

    const userData =
        localStorage.getItem("campusfixUser");


    // Login check
    if (!token || !userData) {

        window.location.href = "login.html";

        return;

    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/complaints/all`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load complaints."
            );

        }


        displayModeratorComplaints(
            data.complaints
        );


    } catch (error) {

        console.error(
            "Moderator complaints error:",
            error
        );

        container.innerHTML = `
            <p>
                ${escapeHTML(error.message)}
            </p>
        `;

    }

}


/*
    Display all complaints.
*/
function displayModeratorComplaints(
    complaints
) {

    const container =
        document.getElementById(
            "complaintsContainer"
        );


    if (!complaints || complaints.length === 0) {

        container.innerHTML = `
            <p>No complaints found.</p>
        `;

        return;

    }


    container.innerHTML = complaints.map(
        (complaint) => {

            const isResolved =
                complaint.status === "resolved";

            return `
                <article class="result-card">

                    <div class="result-header" style="display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 2px solid #111; background: #fff;">
                        <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800;">
                            ${escapeHTML(complaint.title)}
                        </h3>

                        <span class="status-pill ${isResolved ? "resolved" : "pending"}">
                            ${escapeHTML(complaint.status)}
                        </span>
                    </div>

                    <div class="result-row">
                        <span>Complaint ID</span>
                        <strong style="font-family: monospace;">${escapeHTML(complaint.complaintId)}</strong>
                    </div>

                    <div class="result-row">
                        <span>Student</span>
                        <strong>${escapeHTML(complaint.user?.name || "Unknown")}</strong>
                    </div>

                    <div class="result-row">
                        <span>Email</span>
                        <strong>${escapeHTML(complaint.user?.email || "Unknown")}</strong>
                    </div>

                    <div class="result-row">
                        <span>Category</span>
                        <strong style="text-transform: capitalize;">${escapeHTML(complaint.category)}</strong>
                    </div>

                    ${complaint.location ? `
                    <div class="result-row">
                        <span>Location</span>
                        <strong>${escapeHTML(complaint.location)}</strong>
                    </div>
                    ` : ""}

                    <div class="result-row">
                        <span>Description</span>
                        <strong>${escapeHTML(complaint.description)}</strong>
                    </div>

                    <div class="moderator-actions">
                        ${isResolved
                            ? `<span class="status-pill resolved">Resolved</span>`
                            : `
                            <button
                                type="button"
                                class="primary-button"
                                onclick="resolveComplaint('${escapeHTML(complaint.complaintId)}')"
                            >
                                Resolve Complaint &rarr;
                            </button>
                            `
                        }
                    </div>

                </article>
            `;

        }
    ).join("");

}


/*
    Resolve one complaint.
*/
async function resolveComplaint(
    complaintId
) {

    const token =
        localStorage.getItem("campusfixToken");


    if (!token) {

        window.location.href = "login.html";

        return;

    }


    const confirmed =
        confirm(
            `Resolve complaint ${complaintId}?`
        );


    if (!confirmed) return;


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/complaints/${encodeURIComponent(
                complaintId
            )}/resolve`,
            {
                method: "PATCH",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to resolve complaint."
            );

        }


        alert(data.message);


        // Reload the complaint list
        loadModeratorComplaints();


    } catch (error) {

        console.error(
            "Resolve complaint error:",
            error
        );

        alert(error.message);

    }

}


/*
    Basic HTML escaping.
*/
function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
