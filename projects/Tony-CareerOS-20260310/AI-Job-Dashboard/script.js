const STORAGE_KEY = "ai-job-dashboard-state-v3";

let companies = [];
let topTargets = null;
let hiringSignals = [];
let outreachTargets = [];
let managerQueue = [];
let sourceHealth = [];
let linkedinQueue = [];

function safeText(value) {
  const text = value ?? "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatTable(containerId, rows, columns) {
  const container = document.getElementById(containerId);

  if (!rows || rows.length === 0) {
    container.innerHTML = '<p class="muted">No data available yet.</p>';
    return;
  }

  let html = "<table><thead><tr>";
  columns.forEach((column) => {
    html += `<th>${safeText(column.label)}</th>`;
  });
  html += "</tr></thead><tbody>";

  rows.forEach((row) => {
    html += "<tr>";
    columns.forEach((column) => {
      const value = typeof column.render === "function" ? column.render(row) : row[column.key];
      html += `<td>${value ?? ""}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function loadSavedNotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function persistNotes() {
  const snapshot = {};
  companies.forEach((company) => {
    snapshot[company.name] = {
      notes: company.notes || "",
      status: company.status || "not-started"
    };
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function applySavedNotes() {
  const saved = loadSavedNotes();
  companies = companies.map((company) => {
    const item = saved[company.name];
    return item ? { ...company, ...item } : company;
  });
}

function updateSummary() {
  const applied = companies.filter((company) => company.status === "applied").length;
  const interviews = companies.filter((company) => company.status === "interview").length;

  document.getElementById("topJobsCount").textContent = String((topTargets?.topJobs || []).length);
  document.getElementById("signalCompaniesCount").textContent = String(hiringSignals.length);
  document.getElementById("outreachTargetsCount").textContent = String(outreachTargets.length);
  document.getElementById("appliedCount").textContent = String(applied);
  document.getElementById("interviewCount").textContent = String(interviews);
  document.getElementById("manualQueueCount").textContent = String(managerQueue.length);
  document.getElementById("sourceHealthCount").textContent = String(sourceHealth.length);
  document.getElementById("linkedinQueueCount").textContent = String(linkedinQueue.length);
}

function getVisibleCompanies() {
  const search = document.getElementById("searchBox").value.trim().toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const sortBy = document.getElementById("sortBy").value;

  const filtered = companies.filter((company) => {
    const haystack = [
      company.name,
      company.description,
      company.fit,
      company.resumeAngle,
      company.notes || "",
      ...(company.tags || [])
    ].join(" ").toLowerCase();

    if (search && !haystack.includes(search)) return false;
    if (statusFilter !== "all" && company.status !== statusFilter) return false;
    return true;
  });

  filtered.sort((left, right) => {
    if (sortBy === "score-desc") return Number(right.score || 0) - Number(left.score || 0);
    if (sortBy === "name-asc") return left.name.localeCompare(right.name);
    if (sortBy === "status") return left.status.localeCompare(right.status);
    if (sortBy === "updated") return new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0);
    return 0;
  });

  return filtered;
}

function renderResumeAngles() {
  const container = document.getElementById("resumeAngles");
  const jobs = topTargets?.topJobs || [];

  if (!jobs.length) {
    container.innerHTML = '<p class="muted">No resume guidance yet.</p>';
    return;
  }

  container.innerHTML = jobs.slice(0, 4).map((job) => `
    <div class="stack-item">
      <strong>${safeText(job.company)} | ${safeText(job.title)}</strong>
      <span>${safeText((job.resume_angle || [])[0] || "No resume angle available.")}</span>
    </div>
  `).join("");
}

function renderPipelineStatus() {
  const container = document.getElementById("pipelineStatus");
  const statuses = ["researching", "applied", "outreach", "interview"];

  container.innerHTML = statuses.map((status) => {
    const count = companies.filter((company) => company.status === status).length;
    return `
      <div class="stack-item">
        <strong>${safeText(status)}</strong>
        <span>${count} companies</span>
      </div>
    `;
  }).join("");
}

function renderNotes() {
  const container = document.getElementById("notes");
  const visibleCompanies = getVisibleCompanies().slice(0, 8);

  if (!visibleCompanies.length) {
    container.innerHTML = '<p class="muted">No companies match the current filters.</p>';
    return;
  }

  container.innerHTML = visibleCompanies.map((company) => `
    <div class="note-card">
      <h3>${safeText(company.name)}</h3>
      <p class="muted">${safeText(company.fitBadge || "Unknown Fit")} | ${safeText(company.status || "not-started")}</p>
      <textarea data-company="${safeText(company.name)}" placeholder="Notes and follow-up actions...">${safeText(company.notes || "")}</textarea>
    </div>
  `).join("");

  container.querySelectorAll("textarea").forEach((area) => {
    area.addEventListener("input", (event) => {
      const company = companies.find((item) => item.name === event.target.dataset.company);
      if (!company) return;
      company.notes = event.target.value;
      persistNotes();
    });
  });
}

function renderAll() {
  updateSummary();

  formatTable("signalsTable", hiringSignals, [
    { label: "Company", render: (row) => `<strong>${safeText(row.company || "")}</strong>` },
    { label: "Score", render: (row) => `<span class="mini-chip">${safeText(row.signal_score ?? "")}</span>` },
    { label: "Signals", render: (row) => safeText((row.signals || []).join(", ")) },
    { label: "Action", render: (row) => `<span class="status-pill">${safeText(row.recommended_action || "")}</span>` }
  ]);

  formatTable("outreachTable", outreachTargets, [
    { label: "Company", render: (row) => `<strong>${safeText(row.company || "")}</strong>` },
    { label: "Priority", render: (row) => `<span class="status-pill">${safeText(row.outreach_priority || "")}</span>` },
    { label: "Score", render: (row) => `<span class="mini-chip">${safeText(row.score ?? "")}</span>` },
    { label: "Action", render: (row) => safeText(row.suggested_action || "") }
  ]);

  formatTable("managerQueueTable", managerQueue, [
    { label: "Company", render: (row) => `<strong>${safeText(row.company || "")}</strong>` },
    { label: "Target Title", render: (row) => safeText(row.target_title || "") },
    { label: "Likely Manager", render: (row) => safeText(row.probable_hiring_manager || "") },
    { label: "Manual Search", render: (row) => row.manual_search_url ? `<a class="inline-link" href="${safeText(row.manual_search_url)}" target="_blank" rel="noreferrer">Open Search</a>` : "" }
  ]);

  formatTable("linkedinQueueTable", linkedinQueue, [
    { label: "Person", render: (row) => `<strong>${safeText(row.person || "")}</strong><div class="muted">${safeText(row.title || "")}</div>` },
    { label: "Company", render: (row) => safeText(row.company || "") },
    { label: "Priority", render: (row) => `<span class="status-pill priority-${safeText((row.priority || "").toLowerCase())}">${safeText(row.priority || "")}</span>` },
    { label: "LinkedIn", render: (row) => row.linkedin_url ? `<a class="inline-link" href="${safeText(row.linkedin_url)}" target="_blank" rel="noreferrer">Open</a>` : "" },
    { label: "Suggested Note", render: (row) => `<span class="muted">${safeText(row.note || "")}</span>` }
  ]);

  formatTable("sourceHealthTable", sourceHealth, [
    { label: "Source", render: (row) => `<strong>${safeText(row.name || "")}</strong>` },
    { label: "Type", render: (row) => safeText(row.type || "") },
    { label: "Status", render: (row) => `<span class="status-pill">${safeText(row.status || "")}</span>` },
    { label: "Details", render: (row) => safeText(row.details || "") }
  ]);

  formatTable("companiesTable", topTargets?.topCompanies || [], [
    { label: "Company", render: (row) => `<strong>${safeText(row.company || "")}</strong>` },
    { label: "Industry", render: (row) => safeText(row.industry || "") },
    { label: "Score", render: (row) => `<span class="mini-chip">${safeText(row.score ?? "")}</span>` },
    { label: "Signal", render: (row) => safeText(row.hiring_signal || "") }
  ]);

  formatTable("jobsTable", topTargets?.topJobs || [], [
    { label: "Company", render: (row) => `<strong>${safeText(row.company || "")}</strong>` },
    { label: "Role", render: (row) => row.url ? `<a class="inline-link" href="${safeText(row.url)}" target="_blank" rel="noreferrer">${safeText(row.title || "")}</a>` : safeText(row.title || "") },
    { label: "Score", render: (row) => `<span class="mini-chip">${safeText(row.score ?? "")}</span>` },
    { label: "Win", render: (row) => safeText(row.top_win || "") }
  ]);

  renderResumeAngles();
  renderPipelineStatus();
  renderNotes();
}

async function loadData() {
  if (window.location.protocol === "file:") {
    document.body.innerHTML = '<div class="panel" style="margin:20px"><h2>CareerOS Command Center</h2><p class="muted">Serve this folder with `python -m http.server 8000` and open http://127.0.0.1:8000/.</p></div>';
    return;
  }

  const responses = await Promise.all([
    fetch("data/daily_companies.json", { cache: "no-store" }),
    fetch("data/top_targets_today.json", { cache: "no-store" }).catch(() => null),
    fetch("data/hiring_signals.json", { cache: "no-store" }).catch(() => null),
    fetch("data/daily_outreach_targets.json", { cache: "no-store" }).catch(() => null),
    fetch("data/hiring_manager_queue.json", { cache: "no-store" }).catch(() => null),
    fetch("data/source_health.json", { cache: "no-store" }).catch(() => null),
    fetch("data/linkedin_creator_queue.json", { cache: "no-store" }).catch(() => null)
  ]);

  companies = await responses[0].json();
  topTargets = responses[1] && responses[1].ok ? await responses[1].json() : { topJobs: [], topCompanies: [] };
  hiringSignals = responses[2] && responses[2].ok ? await responses[2].json() : [];
  outreachTargets = responses[3] && responses[3].ok ? await responses[3].json() : [];
  managerQueue = responses[4] && responses[4].ok ? await responses[4].json() : [];
  sourceHealth = responses[5] && responses[5].ok ? await responses[5].json() : [];
  const linkedinPayload = responses[6] && responses[6].ok ? await responses[6].json() : { items: [] };
  linkedinQueue = Array.isArray(linkedinPayload) ? linkedinPayload : (linkedinPayload.items || []);

  applySavedNotes();
  renderAll();
}

document.getElementById("refreshBtn").addEventListener("click", loadData);
document.getElementById("saveBtn").addEventListener("click", () => {
  persistNotes();
  alert("Notes saved locally.");
});
document.getElementById("exportBtn").addEventListener("click", () => {
  persistNotes();
  const blob = new Blob([JSON.stringify(companies, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "careeros-dashboard-snapshot.json";
  link.click();
  URL.revokeObjectURL(url);
});
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const text = await file.text();
  companies = JSON.parse(text);
  persistNotes();
  renderAll();
});
document.getElementById("searchBox").addEventListener("input", renderAll);
document.getElementById("statusFilter").addEventListener("change", renderAll);
document.getElementById("sortBy").addEventListener("change", renderAll);

loadData().catch((error) => {
  document.body.innerHTML = `<div class="panel" style="margin:20px"><h2>CareerOS Command Center</h2><p class="muted">Could not load dashboard data: ${safeText(error.message)}</p></div>`;
});
