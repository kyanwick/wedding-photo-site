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
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#8A7E72",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#8A7E72",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
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

// Load Gallery Images (for index.html)
async function loadGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return; // Not on gallery page

    // Fetch list of images with the tag 'wedding'
    // NOTE: You must enable "Resource list" in Cloudinary Settings -> Security -> Restricted image types (uncheck it)
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

        resources.forEach(res => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            
            // Construct optimized image URL for grid (w_800 for better quality on retina)
            const imgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_800,q_auto,f_auto/${res.public_id}.${res.format}`;
            
            // Construct full size URL for lightbox (w_1600 or original if smaller)
            const fullImgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1600,q_auto,f_auto/${res.public_id}.${res.format}`;

            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = "Wedding Photo";
            img.loading = "lazy"; 

            div.appendChild(img);
            
            // Lightbox click event
            div.addEventListener('click', () => {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                lightbox.style.display = "block";
                lightboxImg.src = fullImgUrl;
            });

            gallery.appendChild(div);
        });

        // Lightbox Close Logic
        const lightbox = document.getElementById('lightbox');
        const closeBtn = document.querySelector('.close-lightbox');
        
        if (closeBtn) {
            closeBtn.onclick = function() {
                lightbox.style.display = "none";
            }
        }

        window.onclick = function(event) {
            if (event.target == lightbox) {
                lightbox.style.display = "none";
            }
        }

    } catch (error) {
        console.error(error);
        gallery.innerHTML = `<div class="loading">Error loading photos. <br> ${error.message}</div>`;
    }
}

// Run gallery loader if on index page
document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
    initUploadWidget();
});