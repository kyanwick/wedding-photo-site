// ==========================================
// CONFIGURATION - REPLACE THESE VALUES
// ==========================================
const CLOUD_NAME = 'dzj98hms8'; // Get this from Cloudinary Dashboard
const UPLOAD_PRESET = 'upload'; // Settings -> Upload -> Add Upload Preset (Mode: Unsigned, Tag: wedding)
const TAG = 'wedding'; // The tag used in your upload preset
// ==========================================

// Initialize Upload Widget (for upload.html)
function initUploadWidget() {
    if (CLOUD_NAME === 'dzj98hms8') {
        alert('Please configure your Cloudinary Cloud Name in app.js!');
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
        if (!error && result && result.event === "success") { 
            console.log('Done! Here is the image info: ', result.info); 
            document.getElementById('upload-status').innerHTML += `<p>Uploaded: ${result.info.original_filename}</p>`;
        }
    });

    document.getElementById("upload_widget").addEventListener("click", function(){
        myWidget.open();
    }, false);
}

// Load Gallery Images (for index.html)
async function loadGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return; // Not on gallery page

    if (CLOUD_NAME === 'dzj98hms8') {
        gallery.innerHTML = '<div class="loading">Please configure your Cloudinary Cloud Name in app.js!</div>';
        return;
    }

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
            
            // Construct optimized image URL
            // w_600: Resize width to 600px
            // q_auto: Auto quality
            // f_auto: Auto format (webp/avif)
            const imgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_600,q_auto,f_auto/${res.public_id}.${res.format}`;
            
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = "Wedding Photo";
            img.loading = "lazy"; // Lazy load for performance

            div.appendChild(img);
            gallery.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        gallery.innerHTML = `<div class="loading">Error loading photos. <br> ${error.message}</div>`;
    }
}

// Run gallery loader if on index page
document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
});