// ── DOM refs ──────────────────────────────────────────────────────────────────
const cityText        = document.getElementById("city")
const temperatureText = document.getElementById("temperature")
const unitText        = document.getElementById("unit")
const windText        = document.getElementById("wind")
const timeText        = document.getElementById("time")
const output          = document.getElementById("output")
const statusEl        = document.getElementById("status")
const weatherBox      = document.getElementById("weatherBox")

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(message) {
    output.textContent += message + "\n"
}

function clearOutput() {
    output.textContent = ""
}

function setStatus(msg, type = "") {
    statusEl.textContent = msg
    statusEl.className = type
}

// ── Main function (Parts A–D + all 3 Extension Tasks) ─────────────────────────
async function loadWeatherByCity(cityName, latitude, longitude, btnEl) {
    clearOutput()
    setStatus("Fetching weather for " + cityName + "…", "loading")

    // Highlight active city button
    document.querySelectorAll(".city-buttons button").forEach(b => b.classList.remove("active"))
    if (btnEl) btnEl.classList.add("active")

    try {
        // Part A — fetch
        const url = `https://api.open-meteo.com/v1/forecast` +
                    `?latitude=${latitude}&longitude=${longitude}` +
                    `&current=temperature_2m,wind_speed_10m`

        const response = await fetch(url)

        // Part D — HTTP check
        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status)
        }

        const data = await response.json()

        // Part B — read fields
        const temperature = data.current.temperature_2m
        const wind        = data.current.wind_speed_10m
        const time        = data.current.time           // Extension 2

        // Part B — update DOM
        cityText.textContent        = cityName
        temperatureText.textContent = temperature
        unitText.textContent        = "°C"
        windText.textContent        = wind + " km/h"
        timeText.textContent        = time

        weatherBox.classList.add("loaded")
        setStatus("Last updated: " + time)

        // Part C — log output
        log("City:        " + cityName)
        log("Temperature: " + temperature + " °C")
        log("Wind Speed:  " + wind + " km/h")
        log("Time:        " + time)

        // Extension 3 — temperature-based background class
        document.body.className = temperature < 0 ? "cold" : "mild"

    } catch (error) {
        // Part D — catch
        log("Error: " + error.message)
        setStatus("Failed — " + error.message, "error")
    }
}