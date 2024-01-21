// ==UserScript==
// @name         youtube.user.js
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Change youtube video background color on click.
// @author       alex.perepiyaka@gmail
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

document.body.addEventListener("click", function(){
    document.querySelector('div#movie_player').style.backgroundColor = '#fff';
    document.getElementById('masthead').style.removeProperty("--yt-swatch-primary");
    document.getElementById('masthead').style.removeProperty("--yt-swatch-primary-darker");
    document.getElementById('masthead').style.removeProperty("--yt-swatch-text");
    document.getElementById('masthead').style.removeProperty("--yt-swatch-important-text");
    document.getElementById('masthead').style.removeProperty("--yt-swatch-input-text");
    document.getElementById('masthead').style.removeProperty("--yt-swatch-textbox-bg");
    document.getElementById('masthead').style.removeProperty("--yt-swatch-logo-override");
    document.querySelector('ytd-masthead').removeAttribute('dark');
});
