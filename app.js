// ==========================================
// CONFIGURATION - REPLACE THESE VALUES
// ==========================================
const CLOUD_NAME = 'dzj98hms8'; // Get this from Cloudinary Dashboard
const UPLOAD_PRESET = 'upload'; // Settings -> Upload -> Add Upload Preset (Mode: Unsigned, Tag: wedding)
const TAG = 'wedding'; // The tag used in your upload preset
// ==========================================

// Initialize Upload Widget (for upload.html)
function initUploadWidget() {
    const uploadButton = document.getElementById("upload_widget");
    if (!uploadButton) return; // Not on upload page

    console.log("Initializing Upload Widget...");

    if (typeof cloudinary === "undefined") {
        console.error("Cloudinary script not loaded");
        alert("Error: Cloudinary script not loaded. Check your internet connection.");
        return;
    }

    const myWidget = cloudinary.createUploadWidget({
        cloudName: CLOUD_NAME, 
        uploadPreset: UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: true,
        folder: 'wedding_uploads', // Optional: folder in Cloudinary
        tags: [TAG], // IMPORTANT: This tag allows us to fetch the list later
        styles: {
            palette: {
                window: "#fdfbf7",
                windowBorder: "#c5a059",
                tabIcon: "#4a0404",
                menuIcons: "#556b2f",
                textDark: "#2c241b",
                textLight: "#FFFFFF",
                link: "#4a0404",
                action: "#4a0404",
                inactiveTabIcon: "#8a7e72",
                error: "#F44235",
                inProgress: "#c5a059",
                complete: "#556b2f",
                sourceBg: "#fdfbf7"
            }
        }
    }, (error, result) => { 
        if (error) {
            console.error("Upload Widget Error:", error);
            return;
        }
        if (result && result.event === "success") { 
            console.log('Done! Here is the image info: ', result.info); 
            document.getElementById('upload-status').innerHTML += `<p>Uploaded: ${result.info.original_filename}</p>`;
        }
    });

    uploadButton.addEventListener("click", function(){
        console.log("Opening widget...");
        myWidget.open();
    }, false);
}

// Global variables for lightbox navigation
let galleryImages = [];
let currentImageIndex = 0;

// Load Gallery Images (for index.html)
async function loadGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return; // Not on gallery page

    // Fetch list of images with the tag 'wedding'
    const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch images. Make sure "Resource list" is enabled in Cloudinary Security settings.');
        
        const data = await response.json();
        const resources = data.resources;

        gallery.innerHTML = ''; // Clear loading message

        if (resources.length === 0) {
            gallery.innerHTML = '<div class="loading">No photos uploaded yet. Go to the upload page!</div>';
            return;
        }

        // Store images for navigation
        galleryImages = resources;

        resources.forEach((res, index) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            
            // Construct optimized image URL for grid
            const imgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_800,q_auto,f_auto/${res.public_id}.${res.format}`;
            
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = "Wedding Photo";
            img.loading = "lazy"; 

            div.appendChild(img);
            
            // Lightbox click event
            div.addEventListener('click', () => {
                openLightbox(index);
            });

            gallery.appendChild(div);
        });

        setupLightboxControls();

    } catch (error) {
        console.error(error);
        gallery.innerHTML = `<div class="loading">Error loading photos. <br> ${error.message}</div>`;
    }
}

function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    updateLightboxImage();
    
    lightbox.style.display = "flex"; // Changed to flex for centering
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    const res = galleryImages[currentImageIndex];
    
    // 1. Hide image immediately to indicate change
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transition = 'opacity 0.2s ease';

    const fullImgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1600,q_auto,f_auto/${res.public_id}.${res.format}`;
    
    // 2. Create a temporary image to preload
    const tempImg = new Image();
    tempImg.src = fullImgUrl;
    
    tempImg.onload = function() {
        // 3. Once loaded, update the source and show it
        lightboxImg.src = fullImgUrl;
        lightboxImg.style.opacity = '1';
        
        // 4. Trigger the zoom animation
        lightboxImg.style.animation = 'none';
        lightboxImg.offsetHeight; /* trigger reflow */
        lightboxImg.style.animation = null; 
    };
}

// Navigation function called by HTML buttons
function changeSlide(n) {
    currentImageIndex += n;
    
    // Loop navigation
    if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    } else if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    }
    
    updateLightboxImage();
}

function setupLightboxControls() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.close-lightbox');
    
    // Close Button
    if (closeBtn) {
        closeBtn.onclick = function() {
            lightbox.style.display = "none";
        }
    }

    // Click outside to close
    window.onclick = function(event) {
        if (event.target == lightbox) {
            lightbox.style.display = "none";
        }
    }

    // Keyboard Navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === "flex") {
            if (e.key === "ArrowLeft") {
                changeSlide(-1);
            } else if (e.key === "ArrowRight") {
                changeSlide(1);
            } else if (e.key === "Escape") {
                lightbox.style.display = "none";
            }
        }
    });
}

// Run gallery loader if on index page
document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
    initUploadWidget();
});