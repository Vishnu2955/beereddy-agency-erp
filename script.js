/* ==========================================
   BEEREDDY AGENCY WEBSITE
========================================== */

// ===== IMAGE SLIDER =====

let slideIndex = 0;

const slides = document.querySelectorAll(".slide");

function showSlides() {

    slides.forEach((slide) => {
        slide.classList.remove("active");
    });

    slideIndex++;

    if (slideIndex > slides.length) {
        slideIndex = 1;
    }

    slides[slideIndex - 1].classList.add("active");
}

showSlides();

setInterval(showSlides, 4000);


// ===== SMOOTH SCROLL =====

document.querySelectorAll('nav a').forEach(anchor => {

    anchor.addEventListener('click', function(e) {

        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({

            behavior: 'smooth'

        });

    });

});


// ===== SCROLL ANIMATION =====

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.style.opacity="1";

            entry.target.style.transform="translateY(0px)";

        }

    });

});

sections.forEach(section=>{

    section.style.opacity="0";

    section.style.transform="translateY(50px)";

    section.style.transition="0.8s";

    observer.observe(section);

});


// ===== ACTIVE MENU =====

const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const sectionTop=section.offsetTop-120;

if(pageYOffset>=sectionTop){

current=section.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href")=="#"+current){

link.classList.add("active");

}

});

});


// ===== CONSOLE MESSAGE =====

console.log("BEEREDDY AGENCY Website Loaded Successfully");
const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", function () {
    navbar.classList.toggle("show");
});