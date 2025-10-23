const API_BASE = "http://localhost:8081/api/goal";

/**
 * Safely parses JSON from a fetch response.
 * @param {Response} res The fetch response object.
 * @returns {Promise<any|null>} The parsed JSON or null if parsing fails.
 */
async function safeJson(res) {
  try {
    return await res.json();
  } catch (e) {
    console.error("Failed to parse JSON response.", e);
    return null;
  }
}

/**
 * Fetches goals with strict access control.
 * - Admins can fetch all goals.
 * - Regular users can ONLY fetch their own goals via the /byUser endpoint.
 * - If user is not an admin and has no ID, it returns an empty array to fail securely.
 * @returns {Promise<Array>} A promise that resolves to an array of goals.
 */
// Helper: robustly discover the current regular user's id in localStorage
// (tolerant of varying key names used across the codebase).
const getCurrentUserId = () => {
  const explicit = localStorage.getItem("regularUserID") || localStorage.getItem("regularUserId");
  if (explicit) return explicit;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.toLowerCase().includes('regularuser')) {
      const val = localStorage.getItem(key);
      if (val) return val;
    }
  }
  return null;
};

async function fetchGoalsForCurrentUser() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const userId = getCurrentUserId();

  let url = "";

  // 1. Explicitly check for admin role
  if (isAdmin) {
    url = `${API_BASE}/findAll`;
  }
  // 2. Else, check for a valid regular user ID
  else if (userId) {
    url = `${API_BASE}/byUser/${userId}`;
  }
  // 3. Fail securely: If neither condition is met, do not make a network request.
  else {
    console.warn("Access Denied: No valid user or admin session found.", {
      isAdminLocal: localStorage.getItem("isAdmin"),
      regularUserID: localStorage.getItem("regularUserID"),
      regularUserId: localStorage.getItem("regularUserId")
    });
    return []; // Return empty array immediately
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`goalService: Fetch from ${url} failed with status ${res.status}`);
      return []; // Return empty on HTTP error (e.g., 404, 403)
    }
    return (await safeJson(res)) || [];
  } catch (err) {
    console.error('goalService.fetchGoalsForCurrentUser network error:', err);
    return []; // Return empty on network failure
  }
}

/**
 * Creates a new goal.
 * @param {object} payload - The goal data to create.
 * @returns {Promise<Response>} The fetch Response object.
 */
async function createGoal(payload) {
  return fetch(`${API_BASE}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * Updates an existing goal.
 * @param {object} payload - The goal data to update.
 * @returns {Promise<Response>} The fetch Response object.
 */
async function updateGoal(payload) {
  return fetch(`${API_BASE}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * Deletes a goal by its ID.
 * @param {string|number} id - The ID of the goal to delete.
 * @returns {Promise<Response>} The fetch Response object.
 */
async function deleteGoal(id) {
  return fetch(`${API_BASE}/delete/${id}`, { method: 'DELETE' });
}

// Consolidate all functions into a single service object for export.
const goalService = {
  fetchGoalsForCurrentUser,
  createGoal,
  updateGoal,
  deleteGoal,
};

export default goalService;