const pins = [2,4,5,18,19,21,22,23,25,26,27,32,33];
let stateMap = {};
function initControl() {
  const grid = document.getElementById("gpioGrid");
  if (!grid) return;
  grid.innerHTML = "";
  pins.forEach(pin => {
    const div = document.createElement("div");
    div.className = "card off";
    div.id = "pin-" + pin;

    div.innerHTML = `
      <h3>GPIO ${pin}</h3>
      <p class="status">OFF</p>
      <button onclick="togglePin(${pin})">Toggle</button>
    `;

    grid.appendChild(div);
  });
}
function updatePin(pin, value) {
  const card = document.getElementById("pin-" + pin);
  if (!card) return;
  const status = card.querySelector(".status");
  if (value == "1") {
    card.classList.add("on");
    card.classList.remove("off");
    status.innerText = "ON";
  } else {
    card.classList.add("off");
    card.classList.remove("on");
    status.innerText = "OFF";
  }
  stateMap[pin] = value;
}
function togglePin(pin) {
  const current = stateMap[pin] || "0";
  const cmd = current === "1" ? "OFF" : "ON";

  sendWS(`${cmd}:${pin}`);
}
function handleWSMessage(msg) {
  if (msg.startsWith("PIN:")) {
    const parts = msg.split(":");
    updatePin(parts[1], parts[2]);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("gpioGrid")) {
    initControl();
    connectWS();
  }
});