console.log("JS connected ✅");

/* =========================================================
   L05 — DOM • State • Browser APIs (Student TODO Version)
   Rules:
   - Do NOT change HTML ids
   - Fill ONLY TODO parts
   - No external libraries
   - No console errors
   ========================================================= */

/* =========================================================
   1) DOM EASY — Live Character Counter
   ========================================================= */
const msgInput = document.getElementById("msgInput");
const msgStats = document.getElementById("msgStats");

msgInput.addEventListener("input", function () {
  const len = msgInput.value.length;
  const remaining = 50 - len;
  msgStats.innerText = `Length: ${len} | Remaining: ${remaining}`;

  if (remaining < 10) {
    msgStats.style.color = "crimson";
    msgStats.style.fontWeight = "bold";
  } else {
    msgStats.style.color = "";
    msgStats.style.fontWeight = "";
  }
});


/* =========================================================
   2) DOM MEDIUM — Toggle List (Event Delegation)
   ========================================================= */
const itemInput = document.getElementById("itemInput");
const btnAddItem = document.getElementById("btnAddItem");
const btnClearItems = document.getElementById("btnClearItems");
const itemList = document.getElementById("itemList");
const listStats = document.getElementById("listStats");

let nextId = 1;

function updateListStats() {
  const total = itemList.querySelectorAll("li").length;
  const done = itemList.querySelectorAll("li.done").length;
  listStats.innerText = `Items: ${total} | Done: ${done}`;
}

btnAddItem.onclick = function () {
  const text = itemInput.value.trim();

  if (text === "") return;

  const li = document.createElement("li");
  li.dataset.id = String(nextId);

  const span = document.createElement("span");
  span.textContent = text;

  const btnX = document.createElement("button");
  btnX.textContent = "x";
  btnX.dataset.action = "remove";

  li.appendChild(span);
  li.appendChild(btnX);
  itemList.appendChild(li);

  itemInput.value = "";
  nextId++;
  updateListStats();
};

btnClearItems.onclick = function () {
  itemList.innerHTML = "";
  updateListStats();
};

itemList.onclick = function (e) {
  const li = e.target.closest("li");
  if (!li) return;

  if (e.target.dataset.action === "remove") {
    li.remove();
  } else {
    li.classList.toggle("done");
  }

  updateListStats();
};

updateListStats();


/* =========================================================
   3) STATE EASY — Counter (State → Render)
   ========================================================= */
const btnMinus = document.getElementById("btnMinus");
const btnPlus = document.getElementById("btnPlus");
const btnZero = document.getElementById("btnZero");
const countOut = document.getElementById("countOut");
const parityOut = document.getElementById("parityOut");

const counterState = { count: 0 };

function renderCounter() {
  countOut.innerText = `Count: ${counterState.count}`;
  parityOut.innerText = `Parity: ${counterState.count % 2 === 0 ? "EVEN" : "ODD"}`;
}

btnPlus.onclick = function () {
  counterState.count++;
  renderCounter();
};

btnMinus.onclick = function () {
  counterState.count--;
  renderCounter();
};

btnZero.onclick = function () {
  counterState.count = 0;
  renderCounter();
};

renderCounter();


/* =========================================================
   4) STATE MEDIUM — Mini Cart (Reducer-like)
   ========================================================= */
const btnAddApple = document.getElementById("btnAddApple");
const btnAddBanana = document.getElementById("btnAddBanana");
const btnRemoveLast = document.getElementById("btnRemoveLast");
const btnCartClear = document.getElementById("btnCartClear");
const cartOut = document.getElementById("cartOut");
const cartTotals = document.getElementById("cartTotals");

const cartState = { items: [] };

function dispatch(action) {
  if (action.type === "ADD") {
    cartState.items.push(action.item);
  } else if (action.type === "REMOVE_LAST") {
    if (cartState.items.length > 0) {
      cartState.items.pop();
    }
  } else if (action.type === "CLEAR") {
    cartState.items = [];
  }

  renderCart();
}

function renderCart() {
  const names = cartState.items.map(function (it) {
    return it.name;
  });
  const listText = names.length === 0 ? "(empty)" : names.join(", ");

  let total = 0;
  for (const it of cartState.items) {
    total += it.price;
  }

  cartOut.innerText = `Cart: ${listText}`;
  cartTotals.innerText = `Items: ${cartState.items.length} | Total: €${total}`;
}

btnAddApple.onclick = function () {
  dispatch({ type: "ADD", item: { name: "Apple", price: 2 } });
};

btnAddBanana.onclick = function () {
  dispatch({ type: "ADD", item: { name: "Banana", price: 1 } });
};

btnRemoveLast.onclick = function () {
  dispatch({ type: "REMOVE_LAST" });
};

btnCartClear.onclick = function () {
  dispatch({ type: "CLEAR" });
};

renderCart();


/* =========================================================
   5) Browser API EASY — localStorage Notes (sync)
   ========================================================= */
const noteInput = document.getElementById("noteInput");
const btnSaveNote = document.getElementById("btnSaveNote");
const btnLoadNote = document.getElementById("btnLoadNote");
const btnClearNote = document.getElementById("btnClearNote");
const noteOut = document.getElementById("noteOut");

const NOTE_KEY = "L05_NOTE";

function renderNote(saved) {
  if (saved === null || saved === "") {
    noteOut.innerText = "Saved note: (none)";
  } else {
    noteOut.innerText = `Saved note: ${saved}`;
  }
}

btnSaveNote.onclick = function () {
  const text = noteInput.value.trim();

  localStorage.setItem(NOTE_KEY, text);
  renderNote(text);
  noteInput.value = "";
};

btnLoadNote.onclick = function () {
  const saved = localStorage.getItem(NOTE_KEY);
  renderNote(saved);
};

btnClearNote.onclick = function () {
  localStorage.removeItem(NOTE_KEY);
  renderNote(null);
};

renderNote(localStorage.getItem(NOTE_KEY));


/* =========================================================
   6) Browser API MEDIUM — Geolocation (callback-based)
   ========================================================= */
const btnGetLocation = document.getElementById("btnGetLocation");
const btnClearLocation = document.getElementById("btnClearLocation");
const geoStatus = document.getElementById("geoStatus");
const geoOut = document.getElementById("geoOut");

function clearGeoUI() {
  geoStatus.innerText = "Status: ...";
  geoOut.innerText = "...";
}

btnGetLocation.onclick = function () {
  if (!("geolocation" in navigator)) {
    geoStatus.innerText = "Status: Error: Geolocation not supported";
    geoOut.innerText = "";
    return;
  }

  geoStatus.innerText = "Status: Requesting permission...";
  geoOut.innerText = "";

  const options = { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 };

  navigator.geolocation.getCurrentPosition(
    function success(pos) {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;

      geoStatus.innerText = "Status: OK";
      geoOut.innerText =
        `latitude:  ${latitude}\n` +
        `longitude: ${longitude}\n` +
        `accuracy:  ${accuracy} meters\n` +
        `timestamp: ${new Date(pos.timestamp).toISOString()}`;
    },
    function error(err) {
      let msg = err.message;

      if (err.code === 1) msg = "Permission denied";
      else if (err.code === 2) msg = "Position unavailable";
      else if (err.code === 3) msg = "Timeout";

      geoStatus.innerText = `Status: Error: ${msg}`;
      geoOut.innerText = "";
    },
    options
  );
};

btnClearLocation.onclick = function () {
  clearGeoUI();
};

clearGeoUI();