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

/* ---------------- GALLERY ---------------- */

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

if (lightbox) {
  lightbox.addEventListener("click", () => {
    lightbox.classList.add("hidden");
    lightboxImage.src = "";
  });
}

/* ---------------- ADMIN ---------------- */

if (window.location.pathname.includes("admin.html")) {
  const loadStatsButton = document.getElementById("loadStatsButton");
  const resetButton = document.getElementById("resetButton");
  const passwordInput = document.getElementById("adminPassword");

  let adminPassword = localStorage.getItem("adminPassword") || "";

  if (adminPassword) {
    passwordInput.value = adminPassword;
  }

  loadStatsButton.addEventListener("click", () => {
    adminPassword = passwordInput.value.trim();

    localStorage.setItem("adminPassword", adminPassword);

    fetchStats(adminPassword);
  });

  resetButton.addEventListener("click", () => {
    const confirmReset = confirm("Wirklich alle Zähler zurücksetzen?");

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
        fetchStats(adminPassword);
      });
  });
}

function fetchStats(adminPassword) {
  fetch("/api/stats", {
    headers: {
      "x-admin-password": adminPassword
    }
  })
    .then((res) => {
      if (!res.ok) {
        alert("Falsches Passwort");
        localStorage.removeItem("adminPassword");
        throw new Error("Unauthorized");
      }

      return res.json();
    })
    .then((data) => {
      document.getElementById("adminContent").classList.remove("hidden");
      renderStats(data);
    })
    .catch((err) => {
      console.error(err);
    });
}

function renderStats(data) {
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
}