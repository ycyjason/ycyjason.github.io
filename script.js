/**
 * This document is a javascript file, which stores all the implementation of my javascript functions.
 * There are four unique javascript functions implemented in the website, which are
 * (1)Customised Cursor | (2)Mobile menu | (3)Toggle page button | (4)Scroll to top button
 * 
 * Parameters:
 *      hamburger (const) - select the class .hamburger-menu
 *      navLinks (const) - select the class .nav-menu
 *      workBtn (const) - select the ID #work-btn
 *      galleryBtn (const) - select the ID #gallery-btn
 *      wrkPage (const) - select the ID #works-page
 *      galleryPage (const) - select the ID #gallery-page
 *      mouse_obj (const) - select the class .mouse
 *      current_mouseX (int) - return the value of current_mouseX in localStorage or else set to be 0
 *      current_mouseY (int) - return the value of current_mouseY in localStorage or else set to be 0
 *      scrollX (int) - initialise the value to be 0
 *      scrollY (int) - initialise the value to be 0
 *      clickableItems (array) - return an array of the elements that with the tag name <a> and <button>
 */
const hamburger = document.querySelector('.hamburger-menu')
const navLinks = document.querySelector('.nav-menu')
const workBtn = document.querySelector('#work-btn')
const galleryBtn = document.querySelector('#gallery-btn')
const wrkPage = document.querySelector('#works-page')
const galleryPage = document.querySelector('#gallery-page')
const mouse_obj = document.querySelector('.mouse');
let current_mouseX = localStorage.getItem('current_mouseX') || 0;
let current_mouseY = localStorage.getItem('current_mouseY') || 0;
let scrollX = 0;
let scrollY = 0;
let clickableItems = Array.from(document.querySelectorAll('a, button, .toTop-btn'));
mouse_obj.style.pointerEvents = "none";


function cursorPosition(){
    /**
     *  This function will update the x & y position of my customised cursor, 
     *  in which scroll position and current position will be saved for other pages.
     * 
     *  Parameters:
     *      scrollX: It takes the x-axis scrolled value of the window
     *      scrollY: It takes the y-axis scrolled value of the window    
     * 
     *  Rerferences:
     *      Tutorial for getting mouse coordinates[5]
     *      Smooth mouse movement[6]
     *      Repaint by animation[7] 
     */

    //Find scroll position
    scrollX = window.scrollX || window.pageXOffset;
    scrollY = window.scrollY || window.pageYOffset;

    //Update cursor x & y position
    mouse_obj.style.left = current_mouseX + scrollX + "px";
    mouse_obj.style.top = current_mouseY + scrollY + "px";

    //Save the cursor position to localStorafe for other pages
    localStorage.setItem('current_mouseX', current_mouseX);
    localStorage.setItem('current_mouseY', current_mouseY);

    //Smoothen the movement
    requestAnimationFrame(cursorPosition);
}

document.addEventListener("mousemove", function(event) {
    /**
     *  This function is an event handler, 
     *  which will keep track of the mouse position.
     * 
     *  Parameters:
     *      current_mouseX: Get current mouse x-coordinate
     *      current_mouseY: Get current mouse y-coordinate
     */

    current_mouseX = event.clientX;
    current_mouseY = event.clientY;
  }
  );

clickableItems.forEach((item) =>{
    /**
     *  This function will lop through the items within an array, clickableItems.
     *  If any items is hovered by my customised cursor, the style of it will be changed.
     */

    //When mouse hover on
    item.addEventListener("mouseover", function() {
        mouse_obj.classList.add("mouse-hover");
    });
    
    //When mouse hover out
    item.addEventListener("mouseout", function() {
        mouse_obj.classList.remove("mouse-hover");
    });
});

const mobileMenu = () =>{
    /**
     *  This function allow users to toggle the dropdown menu.
     * 
     *  References:
     *      Hamburger Menu[4]
     */

    //Toggle CSS style
    hamburger.classList.toggle('is-active')
    navLinks.classList.toggle('active')
}

function selectGallery(){
    /**
     *  This function can change the setting of the toggle button 
     *  when users selected "Gallery".
     */

    galleryBtn.classList.toggle('active')
    workBtn.classList.toggle('disable')
    galleryBtn.disabled = true
    workBtn.disabled = false
    wrkPage.style = "display: none"
    galleryPage.style = "display: grid"
    scrollToTop()
}

function selectWork(){
    /**
     *  This function can change the setting of the toggle button 
     *  when users selected "Work".
     */

    galleryBtn.classList.toggle('active')
    workBtn.classList.toggle('disable')
    galleryBtn.disabled = false
    workBtn.disabled = true
    wrkPage.style = "display: flex"
    galleryPage.style = "display: none"
    scrollToTop()
}

function scrollToTop(){
    /**
     *  This function will automatically scroll to the top of the page.
     */
    window.scrollTo({
        top: 0});
}

//Enable the functions
cursorPosition();
hamburger.addEventListener('click', mobileMenu);
workBtn.addEventListener('click', selectWork);
galleryBtn.addEventListener('click', selectGallery);
