// ==UserScript==
// @name         traktTv.user.js
// @namespace    http://tampermonkey.net/
// @version      0.0.6
// @description  Script for Trakt.Tv pages
// @author       alex.perepiyaka@gmail
// @match        https://trakt.tv/*
// @grant        GM_addStyle
// @downloadURL  https://raw.githubusercontent.com/olexandr-perepiyaka/userscripts/master/traktTv.user.js
// @updateURL    https://raw.githubusercontent.com/olexandr-perepiyaka/userscripts/master/traktTv.user.js
// ==/UserScript==

function main() {
    console.log(`document.readyState: ${document.readyState}`);

    console.log(document.location.href);
    if (document.location.href == 'https://trakt.tv/dashboard/schedule') {
        const stylus3 = document.querySelector('#stylus-3');

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://trakt.tv/assets/application-084920e1a7343f64c80392ccbf7bbf01dbca1de364f875069cd4657c57615e88.css';
        link.media = 'all';
        document.head.appendChild(link);

        GM_addStyle(
            `body { font-family: proxima nova semibold; }
            img.real.poster { display: none; }
            a { font-size: 14px; color: black; }
            h4 a { color: #ed1c24; }
            h4, h5, h6 { margin-block: 0; }`
        );

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

function createLinks(event){
    var elem = event.target;
    console.log('line#74', elem);

    if (elem.id !== 'menu4search' && elem.parentNode.id !== "menu4search" && document.getElementById("menu4search")) {
        document.getElementById("menu4search").remove();
    }

    if ((elem.tagName == 'A' || elem.parentNode.tagName == 'A') && elem.className !== "menu_link") {
        var elemHref = elem.tagName == 'A' ? elem.href : elem.parentNode.href;
        var arr = elemHref.split(/\/+/);

        if ((arr[2] == 'shows' || arr[2] == 'movies') && !document.getElementById("menu4search")) {
            var menuDiv = document.createElement("div");
            menuDiv.id = "menu4search";
            menuDiv.style.zIndex = 666;
            menuDiv.style.position = "fixed";
            menuDiv.style.backgroundColor = "#EEE";

            var rect = elem.getBoundingClientRect();
            var menuTop = rect.top + rect.height;
            menuDiv.style.top = menuTop + "px";
            menuDiv.style.left = rect.left + "px";

            var a;

            a = document.createElement("a");
            a.href = 'https://eztvx.to/search/' + arr[3];
            if (arr[4] == 'seasons' && arr[6] == 'episodes') {
                a.href += '-s' + arr[5].padStart(2, '0') + 'e' + arr[7].padStart(2, '0');
            }
            a.target = "_blank";
            a.innerText = "eztvx";
            a.className = "menu_link";
            menuDiv.appendChild(a);

            a = document.createElement('a');
            a.style.marginLeft = '5px';
            a.target = '_blank'
            a.href = 'https://torrentgalaxy.to/torrents.php?search=' + arr[3].replace(/-/g, "+");
            if (arr[4] == 'seasons' && arr[6] == 'episodes') {
                a.href += '+s' + arr[5].padStart(2, '0') + 'e' + arr[7].padStart(2, '0');
            }
            a.target = "_blank";
            a.innerText = "tglx";
            a.className = "menu_link";
            menuDiv.appendChild(a);

            document.body.appendChild(menuDiv);
        }
    }
}

document.addEventListener("mouseover", createLinks);
