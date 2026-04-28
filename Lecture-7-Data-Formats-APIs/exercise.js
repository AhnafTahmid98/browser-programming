// ── DOM refs ──────────────────────────────────────────────────────────────────
const output      = document.getElementById("output")
const userList    = document.getElementById("userList")
const statusEl    = document.getElementById("status")
const btn         = document.getElementById("btnLoadUsers")
const statCount   = document.getElementById("statCount")
const statStatus  = document.getElementById("statStatus")
const resultCount = document.getElementById("resultCount")

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(text) {
    output.textContent += text + "\n"
}

function clearOutput() {
    output.textContent = ""
}

function setStatus(msg, type = "") {
    statusEl.textContent = msg
    statusEl.className = type
}

function initials(name) {
    return name.split(" ").slice(0, 2).map(w => w[0].toUpperCase()).join("")
}

const avatarColors = [
    "#1d4ed8","#7c3aed","#db2777","#d97706",
    "#059669","#dc2626","#0891b2","#65a30d",
    "#9333ea","#0284c7"
]

// ── Main function (Parts A–E) ─────────────────────────────────────────────────
document.getElementById("btnLoadUsers").onclick = loadUsers

async function loadUsers() {
    clearOutput()
    userList.innerHTML = ""
    btn.classList.add("loading")
    setStatus("Fetching users…", "loading")
    statStatus.textContent = "…"
    statCount.textContent  = "…"
    resultCount.textContent = "Loading…"

    try {
        // Part A — fetch from JSONPlaceholder
        const response = await fetch("https://jsonplaceholder.typicode.com/users")

        // Part C — HTTP status check
        if (!response.ok) {
            throw new Error("HTTP error: " + response.status)
        }

        const users = await response.json()

        // Update sidebar stats
        statCount.textContent   = users.length
        statStatus.textContent  = "200"
        resultCount.textContent = users.length + " users loaded"
        setStatus("Loaded " + users.length + " users.", "success")
        btn.classList.remove("loading")

        // Part B — loop with forEach
        users.forEach(function(user, index) {

            const name  = user.name
            const email = user.email
            const city  = user.address.city   // nested field

            // Part B — console log line
            log(name + " - " + email + " - " + city)

            // Part E — render card
            const li = document.createElement("li")
            li.innerHTML = `
                <div class="avatar" style="background:${avatarColors[index % avatarColors.length]}">
                    ${initials(name)}
                </div>
                <div class="user-meta">
                    <div class="user-name">${name}</div>
                    <div class="user-email">${email}</div>
                </div>
                <span class="user-city">${city}</span>
            `
            userList.appendChild(li)
        })

    } catch (error) {
        // Part C — catch block
        log("Error: " + error.message)
        setStatus("Failed — " + error.message, "error")
        statStatus.textContent = "ERR"
        resultCount.textContent = "Failed to load"
        btn.classList.remove("loading")
    }
}