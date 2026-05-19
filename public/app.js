const page = document.body.dataset.page;

if (page) {
  fetch("/api/count/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ page })
  });
}

const galleryImages = document.querySelectorAll(".gallery img");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");

galleryImages.forEach((img) => {
  img.addEventListener("click", () => {
    const imageId = img.dataset.image;

    fetch("/api/count/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image: imageId })
    });

    lightboxImage.src = img.src;
    lightbox.classList.remove("hidden");
  });
});

if (lightbox) {
  lightbox.addEventListener("click", () => {
    lightbox.classList.add("hidden");
    lightboxImage.src = "";
  });
}

if (window.location.pathname.includes("admin.html")) {

  const loadStatsButton = document.getElementById("loadStatsButton");
  const resetButton = document.getElementById("resetButton");

  let adminPassword = "";

  loadStatsButton.addEventListener("click", () => {

    adminPassword =
      document.getElementById("adminPassword").value;

    fetch("/api/stats", {
      headers: {
        "x-admin-password": adminPassword
      }
    })
      .then((res) => {

        if (!res.ok) {
          alert("Falsches Passwort");
          throw new Error("Unauthorized");
        }

        return res.json();
      })
      .then((data) => {

        document
          .getElementById("adminContent")
          .classList
          .remove("hidden");

        renderStats(data);
      })
      .catch((err) => {
        console.error(err);
      });
  });

  resetButton.addEventListener("click", () => {

    const confirmReset =
      confirm("Wirklich alle Zähler zurücksetzen?");

    if (!confirmReset) return;

    fetch("/api/reset", {
      method: "POST",

      headers: {
        "x-admin-password": adminPassword
      }
    })
      .then((res) => {

        if (!res.ok) {
          alert("Nicht autorisiert");
          throw new Error("Unauthorized");
        }

        return res.json();
      })
      .then(() => {

        return fetch("/api/stats", {
          headers: {
            "x-admin-password": adminPassword
          }
        });
      })
      .then((res) => res.json())
      .then((data) => {

        renderStats(data);
      });
  });
}

function renderStats(data) {

  document.getElementById("homeCount").textContent =
    data.pageViews.home;

  document.getElementById("galleryCount").textContent =
    data.pageViews.gallery;

  const imageStats =
    document.getElementById("imageStats");

  imageStats.innerHTML = "";

  Object.entries(data.imageClicks)
    .forEach(([key, value], index) => {

      const box = document.createElement("div");

      box.className = "image-counter-box";

      box.innerHTML = `
        <span>Bild ${index + 1}</span>
        <strong>${value}</strong>
      `;

      imageStats.appendChild(box);
    });
}

function loadStats() {
  fetch("/api/stats")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("homeCount").textContent = data.pageViews.home;
      document.getElementById("galleryCount").textContent = data.pageViews.gallery;

      const imageStats = document.getElementById("imageStats");
      imageStats.innerHTML = "";

      Object.entries(data.imageClicks).forEach(([key, value], index) => {
        const box = document.createElement("div");
        box.className = "image-counter-box";

        box.innerHTML = `
          <span>Bild ${index + 1}</span>
          <strong>${value}</strong>
        `;

        imageStats.appendChild(box);
      });
    });
}

const questionButtons = document.querySelectorAll(".question-zoom");

questionButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();

    const imageId = button.dataset.image;
    const questionImage = button.dataset.question;

    fetch("/api/count/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image: imageId })
    });

    lightboxImage.src = questionImage;
    lightbox.classList.remove("hidden");
  });
});