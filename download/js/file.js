var currentPath = "/";
var selectedItems = [];
var lastSelectedIndex = null;

// ================= LOAD =================
function loadFiles(path) {

  if (typeof path === "undefined") {
    path = "/";
  }

  currentPath = path;

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {

    if (xhr.readyState === 4 && xhr.status === 200) {

      var files = JSON.parse(xhr.responseText);

      renderFiles(files);
    }
  };

  xhr.open(
    "GET",
    "/api/files?path=" + encodeURIComponent(path),
    true
  );

  xhr.send();
}

function renderFiles(files) {

  var tbody = document.querySelector("#fileTable tbody");

  tbody.innerHTML = "";

  for (var i = 0; i < files.length; i++) {

    (function(f, index) {

      var tr = document.createElement("tr");

      tr.className = "file-item";
      tr.setAttribute("data-name", f.name);

      tr.innerHTML =
        "<td>" + getFileIcon(f.name, f.type) + " " + f.name + "</td>" +
        "<td>" + f.type + "</td>" +
        "<td>" + formatSize(f.size) + "</td>" +

        // ===== NEW OPEN COLUMN =====
        "<td style='text-align:center'>" +
          "<button onclick=\"openItem('" + escapeQuote(f.name) + "','" + f.type + "')\">" +
            "📂" +
          "</button>" +
        "</td>";

      // SELECT
      tr.onclick = function(e) {
        handleSelect(e, tr, index);
      };

      // DOUBLE CLICK
      tr.ondblclick = function() {

        openItem(f.name, f.type);
      };

      // RIGHT CLICK
      tr.oncontextmenu = function(e) {

        e.preventDefault();
        showContextMenu(e, f);
      };

      tbody.appendChild(tr);

    })(files[i], i);
  }

  updateStatus(files.length);
}

// ================= OPEN ITEM =================
function openItem(name, type) {

  if (type === "dir") {

    loadFiles(currentPath + "/" + name);
  }
  else {

    downloadFile(name);
  }
}

// ================= SELECT =================
function handleSelect(e, el, index) {

  if (e.ctrlKey) {

    toggleClass(el, "selected");
  }

  else if (e.shiftKey && lastSelectedIndex !== null) {

    var items = document.querySelectorAll(".file-item");

    var start = Math.min(lastSelectedIndex, index);
    var end = Math.max(lastSelectedIndex, index);

    for (var i = 0; i < items.length; i++) {

      if (i >= start && i <= end) {
        addClass(items[i], "selected");
      }
    }
  }

  else {

    var all = document.querySelectorAll(".file-item");

    for (var j = 0; j < all.length; j++) {
      removeClass(all[j], "selected");
    }

    addClass(el, "selected");
  }

  lastSelectedIndex = index;
}

// ================= CREATE FOLDER =================
function createFolder() {

  var name = prompt("Folder name:");

  if (!name) {
    return;
  }

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {

    if (xhr.readyState === 4) {
      loadFiles(currentPath);
    }
  };

  xhr.open("POST", "/api/create-folder", true);

  xhr.setRequestHeader(
    "Content-Type",
    "application/x-www-form-urlencoded"
  );

  xhr.send(
    "name=" + encodeURIComponent(currentPath + "/" + name)
  );
}

// ================= RENAME INLINE (F2) =================
document.addEventListener("keydown", function(e) {

  if (e.keyCode === 113) {

    var el = document.querySelector(".file-item.selected");

    if (!el) {
      return;
    }

    var td = el.getElementsByTagName("td")[0];

    var oldName = td.innerText || td.textContent;

    oldName = oldName.replace(/^📁|🖼️|📄|🧩|⚡|📦/, "").trim();

    td.innerHTML =
      '<input type="text" value="' + oldName + '">';

    var input = td.getElementsByTagName("input")[0];

    input.focus();

    input.onblur = function() {

      var newName = input.value;

      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {

        if (xhr.readyState === 4) {
          loadFiles(currentPath);
        }
      };

      xhr.open("POST", "/api/rename", true);

      xhr.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
      );

      xhr.send(
        "from=" + encodeURIComponent(currentPath + "/" + oldName) +
        "&to=" + encodeURIComponent(currentPath + "/" + newName)
      );
    };
  }
});

// ================= PREVIEW =================
function showPreview(e, name) {

  var preview = document.getElementById("preview");

  if (!preview) {

    preview = document.createElement("img");

    preview.id = "preview";

    document.body.appendChild(preview);
  }

  preview.src =
    "/download?file=" + currentPath + "/" + name;

  preview.style.display = "block";
  preview.style.left = e.pageX + "px";
  preview.style.top = e.pageY + "px";
}

function hidePreview() {

  var preview = document.getElementById("preview");

  if (preview) {
    preview.style.display = "none";
  }
}

// ================= DOWNLOAD =================
function downloadFile(name) {

  window.location =
    "/download?file=" + currentPath + "/" + name;
}

// ================= UPLOAD =================
function uploadFiles(files) {

  for (var i = 0; i < files.length; i++) {

    uploadSingleFile(files[i]);
  }
}

function uploadSingleFile(file) {

  var xhr = new XMLHttpRequest();

  var formData = new FormData();

  formData.append("file", file);
  formData.append("path", currentPath);

  xhr.upload.onprogress = function(e) {

    if (e.lengthComputable) {

      document.getElementById("progressBar").style.width =
        ((e.loaded / e.total) * 100) + "%";
    }
  };

  xhr.onload = function() {

    document.getElementById("progressBar").style.width = "0%";

    loadFiles(currentPath);
  };

  xhr.open("POST", "/upload", true);

  xhr.send(formData);
}

// ================= SEARCH =================
function searchFiles() {

  var keyword =
    document.getElementById("searchBox")
      .value
      .toLowerCase();

  var items = document.querySelectorAll(".file-item");

  for (var i = 0; i < items.length; i++) {

    var name =
      items[i]
      .getAttribute("data-name")
      .toLowerCase();

    if (name.indexOf(keyword) >= 0) {
      items[i].style.display = "";
    }
    else {
      items[i].style.display = "none";
    }
  }
}

// ================= ICON =================
function getFileIcon(name, type) {

  name = name.toLowerCase();

  if (type === "dir") {
    return "📁";
  }

  if (
    endsWith(name, ".png") ||
    endsWith(name, ".jpg") ||
    endsWith(name, ".jpeg") ||
    endsWith(name, ".gif")
  ) {
    return "🖼️";
  }

  if (endsWith(name, ".txt")) {
    return "📄";
  }

  if (endsWith(name, ".json")) {
    return "🧩";
  }

  if (endsWith(name, ".js")) {
    return "⚡";
  }

  return "📦";
}

// ================= ENDSWITH =================
function endsWith(str, suffix) {

  return str.indexOf(
    suffix,
    str.length - suffix.length
  ) !== -1;
}

// ================= ESCAPE =================
function escapeQuote(str) {

  return str.replace(/'/g, "\\'");
}

// ================= CLASS HELPERS =================
function addClass(el, cls) {

  if (el.className.indexOf(cls) === -1) {
    el.className += " " + cls;
  }
}

function removeClass(el, cls) {

  el.className =
    el.className.replace(
      new RegExp("\\b" + cls + "\\b", "g"),
      ""
    );
}

function toggleClass(el, cls) {

  if (el.className.indexOf(cls) === -1) {
    addClass(el, cls);
  }
  else {
    removeClass(el, cls);
  }
}

// ================= INIT =================
document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadFiles("/");
  }
);

// ================= CONTEXT MENU =================
function showContextMenu(e, file) {

  var menu = document.getElementById("contextMenu");

  menu.innerHTML =
    '<div onclick="openItem(\'' + escapeQuote(file.name) + '\',\'' + file.type + '\')">Open</div>' +
    '<div onclick="downloadFile(\'' + escapeQuote(file.name) + '\')">Download</div>' +
    '<div onclick="renameItem(\'' + escapeQuote(file.name) + '\')">Rename</div>' +
    '<div onclick="deleteItem(\'' + escapeQuote(file.name) + '\')">Delete</div>' +
    '<hr>' +
    '<div onclick="createFolder()">New Folder</div>' +
    '<div onclick="loadFiles(currentPath)">Refresh</div>';

  menu.style.display = "block";

  menu.style.left = e.pageX + "px";
  menu.style.top = e.pageY + "px";
}

document.onclick = function() {

  var menu = document.getElementById("contextMenu");

  if (menu) {
    menu.style.display = "none";
  }
};

// ================= STATUS =================
function updateStatus(count) {

  document.getElementById("statusText").innerHTML =
    count + " items";
}

// ================= SIZE =================
function formatSize(size) {

  if (size < 1024) {
    return size + " B";
  }

  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + " KB";
  }

  return (size / 1024 / 1024).toFixed(1) + " MB";
}