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

const canvas = document.getElementById('particle-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    
    // Changed: Use the full window height instead of the parent element
    canvas.height = window.innerHeight; 

    let particlesArray = [];
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', function(event) {
        // Changed: clientX and clientY track the mouse relative to the screen
        // which matches our position: fixed canvas perfectly
        mouse.x = event.clientX; 
        mouse.y = event.clientY;
    });

    // The Particle class
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        
        // Draw the dot
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        // Move the dot, check mouse proximity, and bounce off walls
        update() {
            // --- Mouse Collision Detection ---
            if (mouse.x != undefined && mouse.y != undefined) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                // If the particle is within the mouse's radius, push it away
                if (distance < mouse.radius) {
                    // Calculate how strong the push should be (closer = stronger)
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    
                    // The '7' is the push speed. Increase it to make them fly away faster!
                    const directionX = forceDirectionX * force * 7;
                    const directionY = forceDirectionY * force * 7;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            // Standard wall bounce logic
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
            
            // Standard movement
            this.x += this.directionX;
            this.y += this.directionY;
            
            this.draw();
        }
    }

    // Fill the array with random particles
    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.width * canvas.height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 2) - 1;
            let directionY = (Math.random() * 2) - 1;
            let color = '#ff8080'; // Colour of dots
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Check if dots are close enough to draw a line
    function connect() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    let opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(255, 128, 128, ${opacityValue})`; // Colour of lines fading out
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    window.addEventListener('mousemove', function(event) {
        mouse.x = event.clientX; 
        mouse.y = event.clientY;
    });

    // ADD THIS: Resets the mouse position when it leaves the window
    window.addEventListener('mouseout', function() {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    init();
    animate();
}

// --- Scroll Progress Bar ---
window.addEventListener('scroll', function() {
    // Calculate how far down the user has scrolled
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    
    // Calculate the total scrollable height of the page
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Find the percentage and apply it to the width of the bar
    let scrolled = (winScroll / height) * 100;
    document.getElementById("myBar").style.width = scrolled + "%";
});

// --- Typewriter Effect ---
const textArray = [
    "I'm a developer who loves building things for the web.", 
    "I specialize in Computer Science and using modern technologies.", 
    "I turn ideas into interactive experiences."
];
let textIndex = 0;  // Which sentence we are on
let charIndex = 0;  // Which character we are typing
let isDeleting = false;

// Timing settings (in milliseconds)
const typingDelay = 100;
const erasingDelay = 50;
const newTextDelay = 2000; // Pause before deleting

function type() {
    const currentText = textArray[textIndex];
    
    if (isDeleting) {
        charIndex--; // Remove a character
    } else {
        charIndex++; // Add a character
    }

    // Update the HTML text
    document.getElementById("typewriter-text").textContent = currentText.substring(0, charIndex);

    // Determine how fast to run the next loop
    let typeSpeed = isDeleting ? erasingDelay : typingDelay;

    // If the sentence is fully typed out
    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = newTextDelay; // Pause at the end
        isDeleting = true;        // Start deleting next
    } 
    // If the sentence is fully deleted
    else if (isDeleting && charIndex === 0) {
        isDeleting = false;       // Start typing again
        textIndex = (textIndex + 1) % textArray.length; // Move to next sentence
        typeSpeed = 500;          // Brief pause before typing starts
    }

    setTimeout(type, typeSpeed);
}

// Start the typewriter loop once the page loads
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("typewriter-text")) {
        setTimeout(type, 1000); // Start 1 second after loading
    }
});

// --- Custom Cursor Logic ---

// This listener guarantees the HTML exists before running the script
document.addEventListener("DOMContentLoaded", function() {
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");

    // Check if the elements were actually found
    if (!cursorDot || !cursorOutline) {
        console.error("Cursor error: Could not find .cursor-dot or .cursor-outline in the HTML.");
        return; 
    }
        
    // 1. Movement: Update left/top coordinates
    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;

        // Apply coordinates directly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        
        // Adding a tiny delay creates a smooth trailing effect
        setTimeout(() => {
            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
        }, 50);
    });

    // 2. Interaction: Detect hovers
    const interactiveElements = document.querySelectorAll('a, button, .card-inner, .navbar, .dropbtn');

    interactiveElements.forEach((el) => {
        el.addEventListener("mouseover", () => {
            cursorOutline.classList.add("cursor-link-hover");
        });
        el.addEventListener("mouseout", () => {
            cursorOutline.classList.remove("cursor-link-hover");
        });
    });
});