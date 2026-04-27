function getMessage() {
  const output   = document.getElementById("output");
  const loader   = document.getElementById("loader-msg");
  const errorBox = document.getElementById("err-msg");

  // reset
  output.classList.remove("visible");
  errorBox.classList.remove("visible");
  loader.classList.add("visible");

  fetch("http://localhost:3000/api/message")
    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    .then(data => {
      loader.classList.remove("visible");
      const time = new Date(data.time).toLocaleString();
      output.innerHTML = `
        <div class="row"><span class="key">message</span><span class="val hi">${data.message}</span></div>
        <div class="row"><span class="key">course</span><span class="val">${data.course}</span></div>
        <div class="row"><span class="key">year</span><span class="val">${data.year}</span></div>
        <div class="row"><span class="key">time</span><span class="val">${time}</span></div>
      `;
      output.classList.add("visible");
    })
    .catch(() => {
      loader.classList.remove("visible");
      errorBox.classList.add("visible");
    });
}

function getStudent() {
  const output   = document.getElementById("student-output");
  const loader   = document.getElementById("loader-stu");
  const errorBox = document.getElementById("err-stu");

  output.classList.remove("visible");
  errorBox.classList.remove("visible");
  loader.classList.add("visible");

  fetch("http://localhost:3000/api/student")
    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    .then(data => {
      loader.classList.remove("visible");
      output.innerHTML = `
        <div class="row"><span class="key">name</span><span class="val hi2">${data.name}</span></div>
        <div class="row"><span class="key">role</span><span class="val">${data.role}</span></div>
      `;
      output.classList.add("visible");
    })
    .catch(() => {
      loader.classList.remove("visible");
      errorBox.classList.add("visible");
    });
}