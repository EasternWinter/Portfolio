document.getElementById('helloBtn').addEventListener('click', function() {
    alert("Thanks for visiting my portfolio!");
});
// --- Scroll Animations (Intersection Observer) ---
// 1. Set up the observer to watch elements enter the screen
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        // If the element is currently visible on the screen
        if (entry.isIntersecting) {
            // Add the 'slide-show' class to trigger the CSS animation
            entry.target.classList.add('slide-show');
        }
        else {
            // Element is OFF screen: remove the class so it slides away
            // This resets the animation for the next time you scroll to it
            entry.target.classList.remove('slide-show');
        }
    });
}, {
    // Triggers when at least 10% of the element is visible
    threshold: 0.1 
});

// 2. Find all elements in the HTML that have the 'slide-hidden' class
const hiddenElements = document.querySelectorAll('.slide-hidden');

// 3. Tell the observer to start watching each of those elements
hiddenElements.forEach((el) => observer.observe(el));