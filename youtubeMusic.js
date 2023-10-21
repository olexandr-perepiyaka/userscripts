// ==UserScript==
// @name         youtubeMusic.js
// @namespace    http://tampermonkey.net/
// @version      0.0.3
// @description  Script for Youtube Music pages
// @author       alex.perepiyaka@gmail
// @match        https://music.youtube.com/*
// @downloadURL  https://raw.githubusercontent.com/olexandr-perepiyaka/userscripts/master/youtubeMusic.js
// @updateURL    https://raw.githubusercontent.com/olexandr-perepiyaka/userscripts/master/youtubeMusic.js
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
    getTracksScrobbles();
}

function createScrobbleDiv(trackDiv, trackStr, artistStr) {
    var trackDl, trackScroblesDd, trackInfoDd;
    if (trackDiv.nextSibling && trackDiv.nextSibling.className == 'track-scrobbles-info') {
        trackDl = trackDiv.nextSibling;
        trackScroblesDd = trackDl.querySelector('dd.track-scrobbles');
        trackInfoDd = trackDl.querySelector('dd.track-info');
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
    trackScroblesDd.innerText = 'track scrobbles request';
    trackInfoDd.innerText = 'track info request';
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

function getTracksScrobbles() {
    document.querySelectorAll('dl.track-scrobbles-info').forEach(function (trackDl) {
        var url =
            'https://ws.audioscrobbler.com/2.0/?method=user.getTrackScrobbles'
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
            var date_uts, track_date, track_date_time, track_date_only, track_time_only;
            console.log(this.response);
            if (this.response.error !== undefined) {
                trackDl.querySelector('dd.track-scrobbles').innerHTML = 'track scrobbles error: ' + this.response.message;
            } else {
                var scResHTML = '';
                if (this.response.trackscrobbles.track[0] !== undefined) {
                    var t = 0;
                    for (t in this.response.trackscrobbles.track) {
                        date_uts = parseInt(this.response.trackscrobbles.track[t].date.uts) * 1000;
                        track_date = new Date(date_uts);
                        track_date_time = track_date.toLocaleString("sv-SE");
                        track_date_only = track_date_time.slice(0, 10);
                        track_time_only = track_date_time.slice(-9);
                        scResHTML += (scResHTML == '' ? '' : "<br/>")
                            + '<a class="yt-simple-endpoint yt-formatted-string" href="https://www.last.fm/user/' + lastfmNickname + '/library?&rangetype=1day&from=' + track_date_only + '" target="_blank"> ' + track_date_only + '</a>' + track_time_only
                            + (this.response.trackscrobbles.track[t].album['#text'] != '' ? ' - ' + this.response.trackscrobbles.track[t].album['#text'] : '')
                        ;
                    }
                } else {
                    scResHTML = 'not scrobbled';
                }
                trackDl.querySelector('dd.track-scrobbles').innerHTML = scResHTML;
            }
        };
        xhr.send();
    });
}

main();
