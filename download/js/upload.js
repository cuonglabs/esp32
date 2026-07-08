function initUpload() {
  const form = document.getElementById("uploadForm");
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();

    let formData = new FormData(form);

    let res = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const txt = await res.text();
    document.getElementById("uploadStatus").innerText = txt;
  };
}

document.addEventListener("DOMContentLoaded", () => {
  initUpload();
});