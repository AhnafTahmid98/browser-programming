console.log("JS connected ✅");

/* =========================================================
   STUDENT TODO VERSION (Exercises 9–16)
   Rules:
   - Do NOT change HTML ids
   - Fill only TODO parts
   - Test in browser + console
   ========================================================= */

/* =========================
   Exercise 9 — Grade
   ========================= */
const scoreInput = document.getElementById("scoreInput");
const btnGrade = document.getElementById("btnGrade");
const gradeOut = document.getElementById("gradeOut");

btnGrade.onclick = function () {
  const score = Number(scoreInput.value);

  if (score < 0 || score > 100 || Number.isNaN(score)) {
    gradeOut.innerText = "Grade: Invalid score";
  } else if (score >= 90) {
    gradeOut.innerText = "Grade: A";
  } else if (score >= 80) {
    gradeOut.innerText = "Grade: B";
  } else if (score >= 70) {
    gradeOut.innerText = "Grade: C";
  } else if (score >= 60) {
    gradeOut.innerText = "Grade: D";
  } else {
    gradeOut.innerText = "Grade: F";
  }
};

/* =========================
   Exercise 10 — Even / Odd
   ========================= */
const numEvenOdd = document.getElementById("numEvenOdd");
const btnEvenOdd = document.getElementById("btnEvenOdd");
const evenOddOut = document.getElementById("evenOddOut");

function isEven(n) {
  return n % 2 === 0;
}

btnEvenOdd.onclick = function () {
  const n = Number(numEvenOdd.value);

  if (isEven(n)) {
    evenOddOut.innerText = "Result: EVEN";
  } else {
    evenOddOut.innerText = "Result: ODD";
  }
};

/* =========================
   Exercise 11 — Countdown
   ========================= */
const countdownInput = document.getElementById("countdownInput");
const btnCountdown = document.getElementById("btnCountdown");
const countdownOut = document.getElementById("countdownOut");

btnCountdown.onclick = function () {
  const start = Number(countdownInput.value);

  let text = "";

  for (let i = start; i >= 0; i--) {
    if (i === start) {
      text = text + i;
    } else {
      text = text + " " + i;
    }
  }

  countdownOut.innerText = text;
};

/* =========================
   Exercise 12 — Sum 1..N
   ========================= */
const nSumInput = document.getElementById("nSumInput");
const btnSumN = document.getElementById("btnSumN");
const sumNOut = document.getElementById("sumNOut");

function sumToN(n) {
  let sum = 0;

  for (let i = 1; i <= n; i++) {
    sum = sum + i;
  }

  return sum;
}

btnSumN.onclick = function () {
  const n = Number(nSumInput.value);
  const result = sumToN(n);

  sumNOut.innerText = "Sum: " + result;
};

/* =========================
   Exercise 13 — Repeat Text N Times
   ========================= */
const repeatText = document.getElementById("repeatText");
const repeatCount = document.getElementById("repeatCount");
const btnRepeat = document.getElementById("btnRepeat");
const repeatOut = document.getElementById("repeatOut");

btnRepeat.onclick = function () {
  const text = repeatText.value;
  const times = Number(repeatCount.value);

  let result = "";

  for (let i = 1; i <= times; i++) {
    result = result + text;
  }

  repeatOut.innerText = result;
};

/* =========================
   Exercise 14 — Simple Login
   ========================= */
const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");
const btnLogin = document.getElementById("btnLogin");
const loginOut = document.getElementById("loginOut");

// Students can change these:
const correctUser = "student";
const correctPass = "1234";

btnLogin.onclick = function () {
  const u = loginUser.value.trim();
  const p = loginPass.value.trim();

  if (u === correctUser && p === correctPass) {
    loginOut.innerText = "Status: Welcome ✅";
    loginOut.style.color = "green";
  } else {
    loginOut.innerText = "Status: Wrong login ❌";
    loginOut.style.color = "crimson";
  }
};

/* =========================
   Exercise 15 — Min / Max of 3
   ========================= */
const xInput = document.getElementById("x");
const yInput = document.getElementById("y");
const zInput = document.getElementById("z");
const btnMinMax = document.getElementById("btnMinMax");
const minMaxOut = document.getElementById("minMaxOut");

function min3(a, b, c) {
  let m = a;
  if (b < m) m = b;
  if (c < m) m = c;
  return m;
}

function max3(a, b, c) {
  let m = a;
  if (b > m) m = b;
  if (c > m) m = c;
  return m;
}

btnMinMax.onclick = function () {
  const a = Number(xInput.value);
  const b = Number(yInput.value);
  const c = Number(zInput.value);

  const mn = min3(a, b, c);
  const mx = max3(a, b, c);

  minMaxOut.innerText = "Min: " + mn + " | Max: " + mx;
};

/* =========================
   Exercise 16 — Multiplication Table
   ========================= */
const tableN = document.getElementById("tableN");
const btnTable = document.getElementById("btnTable");
const tableOut = document.getElementById("tableOut");

function makeTable(n) {
  let result = "";

  for (let i = 1; i <= 10; i++) {
    if (i === 1) {
      result = n + " × " + i + " = " + (n * i);
    } else {
      result = result + " | " + n + " × " + i + " = " + (n * i);
    }
  }

  return result;
}

btnTable.onclick = function () {
  const n = Number(tableN.value);

  tableOut.innerText = makeTable(n);
};