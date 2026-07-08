// ================= CONFIG =================
const NAV_ITEMS = [
  { name: "Home", url: "https://cuonglabs.github.io/esp32/download/", icon: "🏠" },
  { name: "Control", url: "https://cuonglabs.github.io/esp32/download/control.html", icon: "🎛️" },
  { name: "Upload", url: "https://cuonglabs.github.io/esp32/download/upload.html", icon: "📤" },
  { name: "Files", url: "https://cuonglabs.github.io/esp32/download/files.html", icon: "📁" },
  { name: "Settings", url: "https://cuonglabs.github.io/esp32/download/settings.html", icon: "⚙️" }
];

// ================= RENDER =================
function renderSidebar() {
  const el = document.getElementById("sidebar");
  if (!el) return;

  let html = `
    <div class="sidebar">
        
        <div class="sidebar-header">
        <div class="logo">ESP32</div>
        <div class="toggle" onclick="toggleSidebar()">☰</div>
        </div>

        <div class="menu">
    `;

  NAV_ITEMS.forEach(item => {
    const active =
      location.pathname === item.url ||
      (item.url === "/" && location.pathname === "/index.html");

    html += `
      <div class="menu-item ${active ? "active" : ""}" 
           onclick="location.href='${item.url}'">
        <span class="icon">${item.icon}</span>
        <span class="text">${item.name}</span>
      </div>
    `;
  });

  el.innerHTML = html;
}

// ================= TOGGLE =================
function toggleSidebar() {
  document.body.classList.toggle("collapsed");
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", renderSidebar);
