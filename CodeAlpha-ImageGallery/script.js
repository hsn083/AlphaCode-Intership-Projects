
// Select Elements
const galleryItems = document.querySelectorAll(".gallery-item");
const filterButtons = document.querySelectorAll(".filter-btn");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");

const closeBtn = document.getElementById("closeBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const photoCount = document.getElementById("photoCount");

let visibleImages = [];
let currentIndex = 0;


document.querySelector(".explore-btn").addEventListener("click", function(e) {
    e.preventDefault();

    document.querySelector("#galleryGrid").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Get All Visible Images
function updateVisibleImages() {
    visibleImages = Array.from(galleryItems).filter(item => {
        return !item.classList.contains("hide");
    });

    photoCount.textContent = `${visibleImages.length} Photos`;
}


// Open Lightbox
function openLightbox(index) {
    currentIndex = index;
    showImage();

    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
}


// Show Current Image
function showImage() {
    const selectedItem = visibleImages[currentIndex];

    if (!selectedItem) return;

    const img = selectedItem.querySelector("img");
    const title = selectedItem.querySelector("h3");

    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    lightboxTitle.textContent = title.textContent;

    lightboxCounter.textContent =
        `${currentIndex + 1} / ${visibleImages.length}`;
}


// Close Lightbox
function closeLightbox() {
    lightbox.classList.remove("show");
    document.body.style.overflow = "auto";
}


// Next Image
function nextImage() {
    currentIndex++;

    if (currentIndex >= visibleImages.length) {
        currentIndex = 0;
    }

    showImage();
}


// Previous Image
function previousImage() {
    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = visibleImages.length - 1;
    }

    showImage();
}


// Click Gallery Images
galleryItems.forEach(item => {
    item.addEventListener("click", () => {

        const index = visibleImages.indexOf(item);

        if (index !== -1) {
            openLightbox(index);
        }

    });
});


// Filter Images
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove Active Class
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const category = button.dataset.filter;

        galleryItems.forEach(item => {

            if (
                category === "all" ||
                item.dataset.category === category
            ) {
                item.classList.remove("hide");
            } else {
                item.classList.add("hide");
            }

        });

        updateVisibleImages();
    });

});


// Button Events
closeBtn.addEventListener("click", closeLightbox);

nextBtn.addEventListener("click", nextImage);

prevBtn.addEventListener("click", previousImage);


// Close when clicking outside image
lightbox.addEventListener("click", (e) => {

    if (e.target === lightbox) {
        closeLightbox();
    }

});



// Keyboard Support
document.addEventListener("keydown", (e) => {

    if (!lightbox.classList.contains("show")) return;

    if (e.key === "Escape") {
        closeLightbox();
    }

    if (e.key === "ArrowRight") {
        nextImage();
    }

    if (e.key === "ArrowLeft") {
        previousImage();
    }

});


// Initialize Gallery
updateVisibleImages();
