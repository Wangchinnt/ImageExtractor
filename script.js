async function extractImagesFromURL(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        return extractImages(html);
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

function extractImages(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const images = doc.querySelectorAll('img');
    let imageData = Array.from(images)
        .map((img) => {
            const src = img.dataset.src || img.src; // Use the data-src attribute if available
            if (isValidImageUrl(src)) {
                return {
                    src,
                    name: src.split('/').pop(),
                    alt: img.alt || 'N/A',
                };
            }
        })
        .filter(Boolean);

    const elements = doc.querySelectorAll('*');
    let backgroundImages = Array.from(elements).reduce((data, el) => {
        const style = window.getComputedStyle(el);
        if (style.backgroundImage !== 'none') {
            const url = style.backgroundImage.slice(5, -2); // remove url("") surrounding the URL
            if (isValidImageUrl(url)) {
                data.push({
                    src: url,
                    name: url.split('/').pop(),
                    alt: 'N/A',
                });
            }
        }
        return data;
    }, []);

    const allImages = [...imageData, ...backgroundImages];

    const uniqueUrls = new Set(allImages.map((img) => img.src));

    const uniqueImages = Array.from(uniqueUrls).map((url) => allImages.find((img) => img.src === url));

    return uniqueImages;
}

// Checks if the given URL points to a valid image
function isValidImageUrl(url) {
    const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    const extension = url.split('.').pop().split('?')[0].toLowerCase();
    return extensions.includes(extension) && !url.endsWith('.svg') && !url.startsWith('data:image/svg+xml');
}

async function extractImagesFromInputURL() {
    const urlInput = document.getElementById('urlInput').value.trim();
    if (urlInput !== '') {
        try {
            const images = await extractImagesFromURL(urlInput);
            console.log('Images:', images);

            // Send images to Flask backend
            const response = await fetch('http://localhost:5000/process_images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'  // Set the content type to JSON
                },
                body: JSON.stringify({ images })  // Convert images to JSON string
            });
            
            // Handle response from backend
            const data = await response.json();
            console.log('Processed data from backend:', data);
            
            // Display processed data on frontend
        } catch (error) {
            console.error('Error processing images:', error);
        }
    } else {
        console.error('URL input is empty.');
    }
}


