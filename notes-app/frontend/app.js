// ── Config ────────────────────────────────────────────────
// Change this to your Render backend URL after deployment
const API_URL = "http://localhost:3000";

// ── DOM refs ──────────────────────────────────────────────
const noteInput  = document.getElementById("note-input");
const addBtn     = document.getElementById("add-btn");
const notesList  = document.getElementById("notes-list");
const countBadge = document.getElementById("count-badge");
const charNum    = document.getElementById("char-num");
const toast      = document.getElementById("toast");

// ── Character counter ─────────────────────────────────────
noteInput.addEventListener("input", () => {
  charNum.textContent = noteInput.value.length;
});

// ── Toast helper ──────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ── Format date ───────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// ── Render notes ──────────────────────────────────────────
function renderNotes(notes) {
  countBadge.textContent = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;

  if (notes.length === 0) {
    notesList.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📝</div>
        <p>No notes yet. Add your first one above.</p>
      </div>`;
    return;
  }

  notesList.innerHTML = notes.map(note => `
    <div class="note-card" id="note-${note.id}">
      <div class="note-body">
        <div class="note-content">${escapeHtml(note.content)}</div>
        <div class="note-time">${formatDate(note.created_at)}</div>
      </div>
      <button class="delete-btn" onclick="deleteNote(${note.id})" title="Delete note">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  `).join("");
}

// Prevent XSS
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Fetch all notes ───────────────────────────────────────
async function loadNotes() {
  try {
    const res = await fetch(`${API_URL}/notes`);
    if (!res.ok) throw new Error();
    const notes = await res.json();
    renderNotes(notes);
  } catch {
    notesList.innerHTML = `<div class="empty"><p>Could not load notes. Is the server running?</p></div>`;
  }
}

// ── Add note ──────────────────────────────────────────────
async function addNote() {
  const content = noteInput.value.trim();
  if (!content) { showToast("Please write something first"); return; }

  addBtn.disabled = true;
  addBtn.textContent = "Adding…";

  try {
    const res = await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error();

    noteInput.value = "";
    charNum.textContent = "0";
    showToast("Note added ✓");
    await loadNotes();
  } catch {
    showToast("Failed to add note");
  } finally {
    addBtn.disabled = false;
    addBtn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Note`;
  }
}

// ── Delete note ───────────────────────────────────────────
async function deleteNote(id) {
  try {
    const res = await fetch(`${API_URL}/notes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();
    showToast("Note deleted");
    await loadNotes();
  } catch {
    showToast("Failed to delete note");
  }
}

// ── Add on Enter (Ctrl+Enter) ─────────────────────────────
noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) addNote();
});

// ── Init ──────────────────────────────────────────────────
loadNotes();