// ==UserScript==
// @name         youtubeMusic.js
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Script for Youtube Music pages
// @author       alex.perepiyaka@gmail
// @match        https://music.youtube.com/*
// ==/UserScript==

var img = document.createElement('img'); img.src = 'https://cdn.last.fm/favicon.ico'; 
img.height = '24px';
document.getElementById('left-content').appendChild(img);
img.onclick = main;

const lastfmNickname = 'xander667';
const lastfmAPIKey = 'a088b0c423e72ee735fd4b1e592341b4';

function main() {
    var trackStr, artistStr;
    var ytmusicPlaylistTracks = document.querySelectorAll('ytmusic-responsive-list-item-renderer.style-scope.ytmusic-playlist-shelf-renderer');

    console.log('[YOUTUBE MUSIC PLAYLIST] ytmusicPlaylistTracks.length: ' + ytmusicPlaylistTracks.length);
    if (ytmusicPlaylistTracks.length > 0) {
        ytmusicPlaylistTracks.forEach(function (trackDiv) {
            trackStr = trackDiv.querySelectorAll('yt-formatted-string')[0].innerText.replace(/[\r\n\t]/g, '').replace(/(?=\s)[^\r\n\t]/g, ' ');
            artistStr = trackDiv.querySelectorAll('yt-formatted-string')[1].innerText.replace(/[\r\n\t]/g, '').replace(/(?=\s)[^\r\n\t]/g, ' ');
            createScrobbleDiv(trackDiv, trackStr, artistStr);
        });
    }

    var ytmusicAlbumTracks = document.getElementById('browse-page').querySelectorAll('ytmusic-responsive-list-item-renderer.style-scope.ytmusic-shelf-renderer');

    console.log('[YOUTUBE MUSIC ALBUM] ytmusicAlbumTracks.length: ' + ytmusicAlbumTracks.length);
    if (ytmusicAlbumTracks.length > 0) {
        if (document.querySelectorAll('yt-formatted-string.style-scope.ytmusic-detail-header-renderer').length > 0) {
            artistStr = document.querySelectorAll('yt-formatted-string.style-scope.ytmusic-detail-header-renderer')[1].textContent.split(" • ")[1];
        }

        ytmusicAlbumTracks.forEach(function (trackDiv) {
            trackStr = trackDiv.querySelector('div.title-column').querySelector('.title').title.replace(/\s+/g, ' ').trim();
            if (trackDiv.querySelector('yt-formatted-string.flex-column.style-scope.ytmusic-responsive-list-item-renderer')
                && trackDiv.querySelector('yt-formatted-string.flex-column.style-scope.ytmusic-responsive-list-item-renderer').title !== ''
            ) {
                artistStr = trackDiv.querySelector('yt-formatted-string.flex-column.style-scope.ytmusic-responsive-list-item-renderer').title.trim();
            }
            createScrobbleDiv(trackDiv, trackStr, artistStr);
        });
    }

    getTracksInfo();
}

function createScrobbleDiv(trackDiv, trackStr, artistStr) {
    var scrblsDiv, trackScrblsDiv, trackScrblsSpan;
    if (trackDiv.nextSibling && trackDiv.nextSibling.className == 'scrobbles-div') {
        scrblsDiv = trackDiv.nextSibling;
        trackScrblsSpan = scrblsDiv.querySelector('span.track-scrobbles-span');
        trackScrblsSpan.innerText = 'request';
        trackScrblsSpanNext = scrblsDiv.querySelector('span:nth-child(2)');
        trackScrblsSpanNext.innerText = " scrobbles of track " + artistStr + " - " + trackStr;
    } else {
        scrblsDiv = document.createElement('div');
        scrblsDiv.className = 'scrobbles-div';
        trackDiv.insertAdjacentElement("afterend", scrblsDiv);

        trackScrblsDiv = document.createElement('div');
        trackScrblsDiv.className = 'tack-scrobbles-div';
        trackScrblsDiv.dataset.track = trackStr;
        trackScrblsDiv.dataset.artist = artistStr;
        scrblsDiv.appendChild(trackScrblsDiv);

        trackScrblsSpan = document.createElement('span');
        trackScrblsSpan.className = 'track-scrobbles-span';
        trackScrblsSpan.innerText = 'request';
        trackScrblsDiv.appendChild(trackScrblsSpan);

        trackScrblsSpan = document.createElement('span');
        trackScrblsSpan.innerText = " scrobbles of track " + artistStr + " - " + trackStr;
        trackScrblsDiv.appendChild(trackScrblsSpan);
    }
}

function getTracksInfo() {
    document.querySelectorAll('div.tack-scrobbles-div').forEach(function (trackDiv) {
        var url =
            'https://ws.audioscrobbler.com/2.0/?method=track.getInfo'
            + '&user=' + lastfmNickname
            + '&api_key=' + lastfmAPIKey
            + '&artist=' + encodeURIComponent(trackDiv.dataset.artist).replace(/%20/g, '+')
            + '&track=' + encodeURIComponent(trackDiv.dataset.track).replace(/%20/g, '+')
            + '&format=json'
        ;
        console.log(url);

        var xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.open("GET", url, true);
        xhr.onloadend = function () {
            //console.log(trackDiv);
            console.log(this.response);

            if (this.response.error !== undefined) {
                trackDiv.querySelector('span.track-scrobbles-span').innerText = 'error during request';
                trackDiv.querySelector('span:nth-child(2)').innerText += '; error message:' + this.response.message;
            } else {
                trackDiv.querySelector('span.track-scrobbles-span').innerText = this.response.track.userplaycount;

                if (this.response.track.userloved == 1) {
                    trackDiv.innerHTML += '<font color="red" title="Loved track">&hearts;&nbsp;</font>';
                }
            }

        };
        xhr.send();
    });
}

main();