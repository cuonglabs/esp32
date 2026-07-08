// ================= WS =================
let ws;
let reconnectInterval = 3000;
let reconnectTimer = null;
let isConnected = false;

function connectWS() {
  console.log("Connecting WS...");

  ws = new WebSocket(`ws://${location.host}/ws`);

  ws.onopen = () => {
    console.log("WS Connected");

    isConnected = true;

    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }
  };

  ws.onclose = () => {
    console.log("WS Disconnected");
    isConnected = false;

    if (!reconnectTimer) {
      reconnectTimer = setInterval(() => {
        connectWS();
      }, reconnectInterval);
    }
  };

  ws.onerror = (err) => {
    console.log("WS Error:", err);
    ws.close();
  };

  ws.onmessage = (event) => {
    handleWSMessage(event.data);
  };
}

function sendWS(cmd) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(cmd);
  } else {
    console.log("WS not ready");
  }
}

// global handler (module khác override)
function handleWSMessage(msg) {
  console.log("WS:", msg);
}

// ================= NAV =================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}