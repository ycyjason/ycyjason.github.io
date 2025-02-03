const background = document.getElementById("ge_back");

document.addEventListener('mousemove', (e) => {
    let x = e.pageX;
    let y = e.clientY + window.scrollY; // Adjust Y position to include scroll offset

    // Get content height and viewport width
    const contentHeight = document.body.scrollHeight; // Total height of content
    const viewportWidth = window.innerWidth;

    // Blob size in pixels (assuming 34vmax)
    const blobSize = 90;  
    const blobRadius = (blobSize * 0.01 * window.innerHeight) / 2; 

    // Constrain X and Y position within the content area
    if (x - blobRadius < 0) {
        x = blobRadius; // Prevent going off the left edge
    }
    if (x + blobRadius > viewportWidth) {
        x = viewportWidth - blobRadius; // Prevent going off the right edge
    }
    if (y - blobRadius < window.scrollY) {
        y = window.scrollY + blobRadius; // Prevent going above the top
    }
    if (y + blobRadius > contentHeight) {
        y = contentHeight - blobRadius; // Prevent going below the content area
    }

    // Animate the blob smoothly within the content area
    background.animate(
        {
            left: `${x}px`,
            top: `${y}px`,
        },
        {
            duration: 3000,    
            fill: "forwards",  
        }
    );
});

