const backToTopButton = document.getElementById("backToTop");

backToTopButton.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior (jump to top)
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});