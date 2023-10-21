// ==UserScript==
// @name         youtubeMusic.js
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  Script for Youtube Music pages
// @author       alex.perepiyaka@gmail
// @match        https://music.youtube.com/*
// @downloadURL  https://raw.githubusercontent.com/olexandr-perepiyaka/userscripts/master/youtubeMusic.js
// ==/UserScript==

var img = document.createElement('img'); img.src = 'https://cdn.last.fm/favicon.ico'; 
img.height = 24;
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
    var trackDl, trackScroblesDd, trackInfoDd;
    if (trackDiv.nextSibling && trackDiv.nextSibling.className == 'track-scrobbles-info') {
        trackDl = trackDiv.nextSibling;
        trackScroblesDd = trackDl.querySelector('dd.track-scrobbles');
        trackInfoDd = trackDl.querySelector('dd.track-info');
        trackScroblesDd.innerText = '';
        trackInfoDd.innerText = '';
    } else {
        trackDl = document.createElement('dl');
        trackDl.className = 'track-scrobbles-info';
        trackDl.dataset.track = trackStr;
        trackDl.dataset.artist = artistStr;
        trackDiv.insertAdjacentElement("afterend", trackDl);

        var trackArtistDt = document.createElement('dt');

        trackArtistDt.innerText = artistStr + " - " + trackStr;
        trackDl.appendChild(trackArtistDt);

        trackScroblesDd = document.createElement('dd');
        trackScroblesDd.className = 'track-scrobbles';
        trackScroblesDd.style.marginInlineStart = '20px';

        trackDl.appendChild(trackScroblesDd);

        trackInfoDd = document.createElement('dd');
        trackInfoDd.className = 'track-info';
        trackInfoDd.style.marginInlineStart = '20px';
        trackDl.appendChild(trackInfoDd);
    }
}

function getTracksInfo() {
    document.querySelectorAll('dl.track-scrobbles-info').forEach(function (trackDl) {
        var url =
            'https://ws.audioscrobbler.com/2.0/?method=track.getInfo'
            + '&user=' + lastfmNickname
            + '&api_key=' + lastfmAPIKey
            + '&artist=' + encodeURIComponent(trackDl.dataset.artist).replace(/%20/g, '+')
            + '&track=' + encodeURIComponent(trackDl.dataset.track).replace(/%20/g, '+')
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
                trackDl.querySelector('dd.track-info').innerHTML = 'track info error: ' + this.response.message;
            } else {
                trackDl.querySelector('dd.track-info').innerHTML = this.response.track.userplaycount + ' playcount' + (this.response.track.userplaycount == 1 ? '' : 's');
                if (this.response.track.userloved == 1) {
                    trackDl.querySelector('dd.track-info').innerHTML += ';&nbsp;<font color="cyan">&hearts;</font> loved track';
                }
            }

        };
        xhr.send();
    });
}

main();
