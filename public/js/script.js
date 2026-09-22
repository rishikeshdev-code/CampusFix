
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupPasswordToggles();
  setupForms();
  setupLogout();
  loadDashboard();
});

/* ---------------- NAVIGATION ---------------- */

function setupNavigation() {
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach((link) => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });
}

/* ---------------- PASSWORD TOGGLES ---------------- */

function setupPasswordToggles() {
  setupPasswordToggle("password", "togglePassword");
  setupPasswordToggle("confirmPassword", "toggleConfirmPassword");
}

function setupPasswordToggle(inputId, buttonId) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);

  if (!input || !button) return;

  button.addEventListener("click", () => {
    const isPassword = input.type === "password";

    input.type = isPassword ? "text" : "password";
    button.textContent = isPassword ? "Hide" : "Show";

    button.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password"
    );

    button.setAttribute("aria-pressed", isPassword);
  });
}

/* ---------------- FORM SETUP ---------------- */

function setupForms() {
  setupLoginForm();
  setupRegisterForm();
  setupForgotPasswordForm();
  setupComplaintForm();
  setupTrackForm();
}

/* ---------------- LOGIN ---------------- */

function setupLoginForm() {
  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      });

      // Store user information and login token.
      localStorage.setItem(
        "campusfixUser",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "campusfixToken",
        data.token
      );

      showMessage(
        "loginMessage",
        data.message,
        "success"
      );

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    } catch (error) {
      showMessage(
        "loginMessage",
        error.message,
        "error"
      );
    }
  });
}

/* ---------------- REGISTER ---------------- */

function setupRegisterForm() {
  const form = document.getElementById("registerForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
      document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showMessage(
        "registerMessage",
        "Passwords do not match.",
        "error"
      );
      return;
    }

    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      showMessage(
        "registerMessage",
        data.message,
        "success"
      );

      form.reset();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      showMessage(
        "registerMessage",
        error.message,
        "error"
      );
    }
  });
}

/* ---------------- FORGOT PASSWORD ---------------- */

function setupForgotPasswordForm() {
  const form = document.getElementById(
    "forgotPasswordForm"
  );

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    try {
      const data = await apiRequest(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email })
        }
      );

      showMessage(
        "forgotPasswordMessage",
        data.message,
        "success"
      );
    } catch (error) {
      showMessage(
        "forgotPasswordMessage",
        error.message,
        "error"
      );
    }
  });
}

/* ---------------- COMPLAINT ---------------- */

function setupComplaintForm() {
  const form = document.getElementById("complaintForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("campusfixToken");

    if (!token) {
      showMessage(
        "formMessage",
        "Please login before submitting a complaint.",
        "error"
      );

      return;
    }

    const title = document.getElementById("title").value.trim();
    const category =
      document.getElementById("category").value;
    const location =
      document.getElementById("location").value.trim();
    const description =
      document.getElementById("description").value.trim();

    const priorityInput =
      document.querySelector(
        'input[name="priority"]:checked'
      );

    const priority = priorityInput
      ? priorityInput.value
      : "medium";

    try {
      const data = await apiRequest(
        "/api/complaints",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            title,
            category,
            location,
            description,
            priority
          })
        }
      );

      showMessage(
        "formMessage",
        `Complaint submitted successfully. ID: ${data.complaint.complaintId}`,
        "success"
      );

      form.reset();
    } catch (error) {
      showMessage(
        "formMessage",
        error.message,
        "error"
      );
    }
  });
}

/* ---------------- TRACK COMPLAINT ---------------- */

function setupTrackForm() {
  const form = document.getElementById("trackForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const complaintId =
      document.getElementById("complaintId").value
        .trim();

    if (!complaintId) {
      showMessage(
        "trackMessage",
        "Please enter a complaint ID.",
        "error"
      );
      return;
    }

    try {
      const data = await apiRequest(
        `/api/complaints/${encodeURIComponent(
          complaintId
        )}`
      );

      displayComplaint(data.complaint);

      showMessage(
        "trackMessage",
        "Complaint found.",
        "success"
      );
    } catch (error) {
      showMessage(
        "trackMessage",
        error.message,
        "error"
      );

      const result =
        document.getElementById("complaintResult");

      if (result) {
        result.hidden = true;
      }
    }
  });
}

/* ---------------- DISPLAY COMPLAINT ---------------- */

function displayComplaint(complaint) {
  const result =
    document.getElementById("complaintResult");

  if (!result) return;

  const fields = {
    resultId: complaint.complaintId,
    resultTitle: complaint.title,
    resultCategory: complaint.category,
    resultLocation: complaint.location,
    resultStatus: complaint.status,
    resultDate: formatDate(complaint.createdAt)
  };

  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  });

  result.hidden = false;
}

/* ---------------- DASHBOARD ---------------- */

async function loadDashboard() {
  const complaintList =
    document.getElementById("complaintList");

  if (!complaintList) return;

  const userData =
    localStorage.getItem("campusfixUser");

  const token =
    localStorage.getItem("campusfixToken");

  if (!userData || !token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const user = JSON.parse(userData);

    const accountName =
      document.getElementById("accountName");

    const accountEmail =
      document.getElementById("accountEmail");

    const welcomeName =
      document.getElementById("welcomeName") ||
      document.getElementById("userName");

    if (accountName) {
      accountName.textContent = user.name;
    }

    if (accountEmail) {
      accountEmail.textContent = user.email;
    }

    if (welcomeName) {
      welcomeName.textContent = user.name;
    }

    const data = await apiRequest(
      "/api/complaints/my",
      {
        token
      }
    );

    displayDashboardComplaints(
      data.complaints
    );
  } catch (error) {
    showMessage(
      "dashboardMessage",
      error.message,
      "error"
    );
  }
}

/* ---------------- DASHBOARD COMPLAINTS ---------------- */

function displayDashboardComplaints(complaints) {
  const list =
    document.getElementById("complaintList");

  if (!list) return;

  const totalElement =
    document.getElementById("totalComplaints");

  const pendingElement =
    document.getElementById("pendingComplaints");

  const resolvedElement =
    document.getElementById("resolvedComplaints");

  if (totalElement) {
    totalElement.textContent = complaints.length;
  }

  if (pendingElement) {
    pendingElement.textContent =
      complaints.filter(
        (item) =>
          item.status !== "resolved"
      ).length;
  }

  if (resolvedElement) {
    resolvedElement.textContent =
      complaints.filter(
        (item) =>
          item.status === "resolved"
      ).length;
  }

  if (complaints.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>No complaints yet.</h3>
        <p>
          You have not submitted any complaints.
        </p>
        <a href="complaint.html">
          Report a Problem
        </a>
      </div>
    `;

    return;
  }

  list.innerHTML = complaints
    .map(
      (complaint) => `
        <article class="result-card">
          <div class="result-header">
            <strong>
              ${escapeHTML(complaint.title)}
            </strong>

            <span>
              ${escapeHTML(complaint.status)}
            </span>
          </div>

          <div class="result-row">
            <span>Complaint ID</span>
            <strong>
              ${escapeHTML(complaint.complaintId)}
            </strong>
          </div>

          <div class="result-row">
            <span>Category</span>
            <strong>
              ${escapeHTML(complaint.category)}
            </strong>
          </div>

          <div class="result-row">
            <span>Priority</span>
            <strong>
              ${escapeHTML(complaint.priority)}
            </strong>
          </div>

          <div class="result-row">
            <span>Date</span>
            <strong>
              ${formatDate(complaint.createdAt)}
            </strong>
          </div>
        </article>
      `
    )
    .join("");
}

/* ---------------- LOGOUT ---------------- */

function setupLogout() {
  const logoutButton =
    document.getElementById("logoutButton") ||
    document.getElementById("logoutLink");

  if (!logoutButton) return;

  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("campusfixUser");
    localStorage.removeItem("campusfixToken");

    window.location.href = "login.html";
  });
}

/* ---------------- API HELPER ---------------- */

const isLocalStaticServer =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL =
  isLocalStaticServer && window.location.port !== "5000"
    ? "http://localhost:5000"
    : "";

async function apiRequest(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const fetchOptions = {
    method,
    headers
  };

  if (options.body && method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    fetchOptions.body = options.body;
  }

  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}${url}`;

  let response;
  try {
    response = await fetch(fullUrl, fetchOptions);
  } catch (networkError) {
    throw new Error("Network error. Unable to reach server.");
  }

  let data;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      throw new Error(`Failed to parse response from ${url} (HTTP ${response.status})`);
    }
  } else {
    throw new Error(
      `Server returned ${response.status} (${response.statusText || "Unexpected format"}). Expected JSON.`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}.`
    );
  }

  return data;
}

/* ---------------- MESSAGE ---------------- */

function showMessage(elementId, message, type) {
  const element =
    document.getElementById(elementId);

  if (!element) return;

  element.textContent = message;
  element.className =
    `form-message ${type}`;
}

/* ---------------- DATE ---------------- */

function formatDate(date) {
  if (!date) return "Unknown";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

/* ---------------- SECURITY ---------------- */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

