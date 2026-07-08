async function loadSettings() {
  let res = await fetch('/api/settings');
  let data = await res.json();

  document.getElementById("settingsBox").innerText =
    JSON.stringify(data, null, 2);
}

async function saveSettings() {
  await fetch('/api/settings', {
    method: 'POST',
    body: JSON.stringify({ device: "ESP32-NEW" })
  });

  alert("Saved");
}

async function loadNet() {
  let res = await fetch("/api/network");
  let d = await res.json();

  document.getElementById("ssidSelect").value = d.ssid;
  document.getElementById("pass").value = d.pass;
  document.getElementById("dhcp").checked = d.dhcp;

  document.getElementById("ip").value = d.ip;
  document.getElementById("gateway").value = d.gateway;
  document.getElementById("subnet").value = d.subnet;

  toggleStatic();
}

function toggleStatic() {
  staticBox.style.display = dhcp.checked ? "none" : "block";
}

dhcp.onchange = toggleStatic;

async function saveNet() {
  const data = new URLSearchParams({
    ssid: document.getElementById("ssidSelect").value,
    pass: document.getElementById("pass").value,
    ip: document.getElementById("ip").value,
    gateway: document.getElementById("gateway").value,
    subnet: document.getElementById("subnet").value
  });

  if (document.getElementById("dhcp").checked) {
    data.append("dhcp", "1");
  }

  await fetch("/api/network", {
    method: "POST",
    body: data
  });

  alert("Saved! Device will reboot.");
}

async function scanWifi() {
  const select = document.getElementById("ssidSelect");

  let current = document.getElementById("ssidSelect").value;

  select.innerHTML = `<option>Scanning...</option>`;

  let res = await fetch("/api/scan-wifi");
  let list = await res.json();

  select.innerHTML = "";

  if (list.length === 0) {
    select.innerHTML = `<option>Scanning...</option>`;
    setTimeout(scanWifi, 1000);
    return;
  }

  list.sort((a,b) => b.rssi - a.rssi);

  list.forEach(wifi => {
    const opt = document.createElement("option");

    let lock = wifi.enc === "open" ? "🔓" : "🔒";
    opt.value = wifi.ssid;
    opt.textContent = `${lock} ${wifi.ssid} (${wifi.rssi})`;

    select.appendChild(opt);

    if (wifi.ssid === current) {
      opt.selected = true;
    }

  });

  // auto fill SSID
  select.onchange = () => {
    document.getElementById("ssid").value = select.value;
  };
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes/1024).toFixed(1) + " KB";
  return (bytes/1024/1024).toFixed(2) + " MB";
}

async function uploadFW() {
  const fileInput = document.getElementById("fw");
  const file = fileInput.files[0];

  const status = document.getElementById("fwStatus");
  const bar = document.getElementById("progressBar");
  const info = document.getElementById("fwInfo");
  const btn = document.getElementById("btnUpload");

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB

  if (!file) {
    alert("Chọn file .bin trước!");
    return;
  }

  if (!file.name.endsWith(".bin")) {
    alert("Chỉ chấp nhận file .bin");
    return;
  }

  if (file.size > MAX_SIZE) {
    alert("File quá lớn (>2MB)");
    return;
  }

  // hiển thị info
  info.innerText = `File: ${file.name} (${formatSize(file.size)})`;

  btn.disabled = true;
  status.innerText = "Uploading...";
  bar.style.width = "0%";

  let xhr = new XMLHttpRequest();

  xhr.open("POST", "/update", true);

  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      let percent = (e.loaded / e.total) * 100;
      bar.style.width = percent.toFixed(0) + "%";
      status.innerText = "Uploading: " + percent.toFixed(0) + "%";
    }
  };

  xhr.onload = function() {
    if (xhr.status === 200) {
      bar.style.width = "100%";
      status.innerText = "Update success! Rebooting...";
    } else {
      status.innerText = "Update failed!";
      btn.disabled = false;
    }
  };

  xhr.onerror = function() {
    status.innerText = "Upload error!";
    btn.disabled = false;
  };

  let form = new FormData();
  form.append("update", file);

  xhr.send(form);
}

async function loadVersion() {
  let res = await fetch("/api/version");
  let txt = await res.text();

  document.getElementById("fwVersion").innerText = txt;
}

window.onload = () => {
  loadNet();
  scanWifi();
  loadVersion();
};