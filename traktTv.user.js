// ==UserScript==
// @name         traktTv.user.js
// @namespace    http://tampermonkey.net/
// @version      0.0.3
// @description  Script for Trakt.Tv pages
// @author       alex.perepiyaka@gmail
// @match        https://trakt.tv/*
// @downloadURL  https://raw.githubusercontent.com/olexandr-perepiyaka/userscripts/master/traktTv.user.js
// @updateURL    https://raw.githubusercontent.com/olexandr-perepiyaka/userscripts/master/traktTv.user.js
// ==/UserScript==

function main() {
    console.log(`document.readyState: ${document.readyState}`);

    console.log(document.location.href);
    if (document.location.href == 'https://trakt.tv/dashboard/schedule') {
        const stylus3 = document.querySelector('#stylus-3');
        stylus3.sheet.insertRule('img.real.poster { display: none; }', stylus3.sheet.cssRules.length);
        stylus3.sheet.insertRule('body { font-family: proxima nova semibold;}', stylus3.sheet.cssRules.length);
        stylus3.sheet.insertRule('a { font-size: 14px; color: black; }', stylus3.sheet.cssRules.length);
        stylus3.sheet.insertRule('h4 a { color: #ed1c24; }', stylus3.sheet.cssRules.length);
        stylus3.sheet.insertRule('h4, h5, h6 { margin-block: 0; }', stylus3.sheet.cssRules.length);

        /*const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://trakt.tv/assets/application-084920e1a7343f64c80392ccbf7bbf01dbca1de364f875069cd4657c57615e88.css';
        link.media = 'all';
        document.head.appendChild(link);*/

        document.querySelectorAll('a').forEach(function (a) {
            var arr = a.href.split(/\/+/);
            if (arr[2] == 'shows' || arr[2] == 'movies') {
                const span = document.createElement('span');
                a.insertAdjacentElement("afterend", span);

                var ea, img;
                ea = document.createElement('a');
                ea.style.marginLeft = '5px';
                ea.target = '_blank'
                ea.href = 'https://eztvx.to/search/' + arr[3];
                if (arr[4] == 'seasons' && arr[6] == 'episodes') {
                    ea.href += '-s' + arr[5].padStart(2, '0') + 'e' + arr[7].padStart(2, '0');
                }
                span.appendChild(ea);
                img = document.createElement('img');
                img.src = 'https://eztvx.to/favicon.ico';
                ea.appendChild(img);

                ea = document.createElement('a');
                ea.style.marginLeft = '5px';
                ea.target = '_blank'
                ea.href = 'https://torrentgalaxy.to/torrents.php?search=' + arr[3].replace("-", "+");
                if (arr[4] == 'seasons' && arr[6] == 'episodes') {
                    ea.href += '+s' + arr[5].padStart(2, '0') + 'e' + arr[7].padStart(2, '0');
                }
                span.appendChild(ea);
                img = document.createElement('img');
                img.src = 'https://torrentgalaxy.to/common/favicon/favicon.ico';
                ea.appendChild(img);
            }
        });
    }
}

window.addEventListener("load", main);