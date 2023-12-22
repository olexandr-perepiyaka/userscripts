// ==UserScript==
// @name         youtubeMusic.js
// @namespace    http://tampermonkey.net/
// @version      1.2.2
// @description  Script for Youtube Music pages
// @author       alex.perepiyaka@gmail
// @match        https://music.youtube.com/*
// @downloadURL  https://raw.githubusercontent.com/olexandr-perepiyaka/userscripts/master/youtubeMusic.js
// @updateURL    https://raw.githubusercontent.com/olexandr-perepiyaka/userscripts/master/youtubeMusic.js
// @require      https://apis.google.com/js/api.js
// ==/UserScript==

var img = document.createElement('img');
img.src = 'https://cdn.last.fm/favicon.ico';
img.height = 24;
img.style.cursor = 'pointer';
img.style.marginLeft = '24px';
document.getElementById('left-content').appendChild(img);
img.onclick = main;

const lastfmNickname = 'xander667';
const lastfmAPIKey = 'a088b0c423e72ee735fd4b1e592341b4';

function main() {
    var trackStr, artistStr;
    var artistsArr = [];

    var ytmusicPlaylistTracks = document.getElementById('browse-page').querySelectorAll('ytmusic-responsive-list-item-renderer.style-scope.ytmusic-playlist-shelf-renderer');

    console.log('[YOUTUBE MUSIC PLAYLIST] ytmusicPlaylistTracks.length: ' + ytmusicPlaylistTracks.length);
    if (ytmusicPlaylistTracks.length > 0) {
        ytmusicPlaylistTracks.forEach(function (trackDiv) {
            trackStr = trackDiv.querySelectorAll('yt-formatted-string')[0].innerText.replace(/[\r\n\t\p{C}]/gu, '').replace(/(?=\s)[^\r\n\t]/g, ' ');
            artistStr = trackDiv.querySelectorAll('yt-formatted-string')[1].innerText.replace(/[\r\n\t\p{C}]/gu, '').replace(/(?=\s)[^\r\n\t]/g, ' ');
            createScrobbleDiv(trackDiv, trackStr, artistStr);
        });
    }

    var ytmusicAlbumTracks = document.getElementById('browse-page').querySelectorAll('ytmusic-responsive-list-item-renderer.style-scope.ytmusic-shelf-renderer');

    console.log('[YOUTUBE MUSIC ALBUM] ytmusicAlbumTracks.length: ' + ytmusicAlbumTracks.length);
    if (ytmusicAlbumTracks.length > 0) {
        if (document.querySelectorAll('yt-formatted-string.style-scope.ytmusic-detail-header-renderer').length > 0) {
            artistStr = document.querySelectorAll('yt-formatted-string.style-scope.ytmusic-detail-header-renderer')[1].textContent.split(" • ")[1].replace(/\p{C}/gu, '');
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

    document.querySelectorAll('dl.track-scrobbles-info').forEach(function (trackDl) {
        getTrackInfo(trackDl);
        getTrackScrobbles(trackDl);
    });

    document.querySelectorAll('dl.artist').forEach(function (artistDl) {
        if (artistsArr.indexOf(artistDl.dataset.artist) < 0) {
            artistsArr.push(artistDl.dataset.artist);
            getArtistInfo(artistDl.dataset.artist);
        }
    });

    console.log('artistsArr', artistsArr);

    getAlbumData();
}

function createScrobbleDiv(trackDiv, trackStr, artistStr) {
    if (trackDiv.nextSibling && trackDiv.nextSibling.className == 'lastfm-info') {
    } else {
        var trackInfoDd, artistDl;
        var lasfmInfoDiv = document.createElement('dl');
        lasfmInfoDiv.className = 'lastfm-info';
        lasfmInfoDiv.style.fontWeight = 'bold';
        trackDiv.insertAdjacentElement("afterend", lasfmInfoDiv);

        var trackDl = document.createElement('dl');
        trackDl.className = 'track-scrobbles-info';
        trackDl.dataset.track = trackStr;
        trackDl.dataset.artist = artistStr;
        lasfmInfoDiv.appendChild(trackDl);

        var trackArtistDt = document.createElement('dt');
        trackArtistDt.innerText = artistStr + " - " + trackStr;
        trackDl.appendChild(trackArtistDt);

        var trackScroblesDd = document.createElement('dd');
        trackScroblesDd.className = 'track-scrobbles';
        trackScroblesDd.style.marginInlineStart = '20px';
        trackScroblesDd.style.cursor = 'pointer';
        trackScroblesDd.onclick = function() {
            getTrackInfo(trackDl);
            getTrackScrobbles(trackDl);
            getArtistInfo(trackDl.dataset.artist);
        };
        trackDl.appendChild(trackScroblesDd);

        trackInfoDd = document.createElement('dd');
        trackInfoDd.className = 'track-info';
        trackInfoDd.style.marginInlineStart = '20px';
        trackDl.appendChild(trackInfoDd);

        console.log('artistStr', artistStr);
        var mainArtistDl = createArtistInfoDl(artistStr);
        lasfmInfoDiv.appendChild(mainArtistDl);

        var artistsToSplit = '';
        if(/&/.exec(artistStr) || /,/.exec(artistStr)) {
            artistsToSplit += artistStr;
        }

        var featArtist = /\(feat. (.*?)\)/.exec(trackStr);
        console.log('featArtist', featArtist);
        if (featArtist && featArtist[1]) {
            console.log('featArtist[1]', featArtist[1]);
            var featArtistDl = createArtistInfoDl(featArtist[1]);
            lasfmInfoDiv.appendChild(featArtistDl);

            if(/&/.exec(featArtist[1])) {
                artistsToSplit += (artistsToSplit ? ', ' : '') + featArtist[1];
            }
        }

        var artistsToSplitAfterReplace = artistsToSplit.replace(/ & /g, ', ').replace(/[,,]+/g, ',');

        if (artistsToSplitAfterReplace != '') {
            var splittedArtist = artistsToSplitAfterReplace.split(', ');

            for (var j = 0; j < splittedArtist.length; j++) {
                if (splittedArtist[j] != artistStr) {
                    console.log('splittedArtist[j]', splittedArtist[j]);
                    var splitArtistDl = createArtistInfoDl(splittedArtist[j]);
                    lasfmInfoDiv.appendChild(splitArtistDl);
                }
            }
        }
    }
}

function createArtistInfoDl(artist) {
    var artistDl = document.createElement('dl');
    artistDl.className = 'artist';
    artistDl.dataset.artist = artist;

    var artistDt = document.createElement('dt');
    artistDt.innerText = artist;
    artistDl.appendChild(artistDt);

    var artistDd = document.createElement('dd');
    artistDd.className = 'artist-tags';
    artistDd.style.marginInlineStart = '20px';
    artistDl.appendChild(artistDd);

    artistDd = document.createElement('dd');
    artistDd.className = 'artist-userplaycount';
    artistDd.style.marginInlineStart = '20px';
    artistDl.appendChild(artistDd);

    return artistDl;
}

function getTrackInfo(trackDl) {
    trackDl.querySelector('dd.track-info').innerHTML = (trackDl.querySelector('dd.track-info').innerHTML == '' ? '' : '&orarr;&nbsp;' + trackDl.querySelector('dd.track-info').innerHTML);

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
        //console.log(this.response);
        if (this.response.error !== undefined) {
            trackDl.querySelector('dd.track-info').innerHTML = 'track info error: ' + this.response.message;
        } else {
            /*trackDl.querySelector('dd.track-info').innerHTML = this.response.track.userplaycount + ' playcount' + (this.response.track.userplaycount == 1 ? '' : 's');*/
            if (this.response.track.userloved == 1) {
                trackDl.querySelector('dd.track-info').innerHTML = '<font color="red">&hearts;</font> loved track';
            } else {
                trackDl.querySelector('dd.track-info').innerHTML = '';
            }
        }
    };
    xhr.send();
}

function getTrackScrobbles(trackDl) {
    trackDl.querySelector('dd.track-scrobbles').innerHTML = '&orarr;&nbsp;' + trackDl.querySelector('dd.track-scrobbles').innerHTML;
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
        //console.log(this.response);
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
                        + '<a class="yt-simple-endpoint yt-formatted-string" href="https://www.last.fm/user/'
                        + lastfmNickname
                        + '/library?&rangetype=1day&from='
                        + track_date_only
                        + '" target="_blank"> '
                        + track_date_only + '</a>' + track_time_only
                        + (this.response.trackscrobbles.track[t].album['#text'] != '' ? ' - ' + this.response.trackscrobbles.track[t].album['#text'] : '')
                    ;
                }
                trackDl.parentNode.previousSibling.style.borderRight = 'none';
            } else {
                scResHTML = '<font color="red">not scrobbled</font>';
                trackDl.parentNode.previousSibling.style.borderRight = '3px solid #b90000';
            }
            trackDl.querySelector('dd.track-scrobbles').innerHTML = scResHTML;
        }
    };
    xhr.send();
}

function getArtistInfo(artist) {
    document.querySelectorAll('dl.artist[data-artist="' + artist +'"]').forEach(function (artistDl) {
        artistDl.querySelector('dd.artist-tags').innerHTML = artistDl.querySelector('dd.artist-tags').innerHTML == '' ? '' : '&orarr;&nbsp;' + artistDl.querySelector('dd.artist-tags').innerHTML;
        artistDl.querySelector('dd.artist-userplaycount').innerHTML = artistDl.querySelector('dd.artist-userplaycount').innerHTML == '' ? '' : '&orarr;&nbsp;' + artistDl.querySelector('dd.artist-userplaycount').innerHTML;
    });

    const url =
        'https://ws.audioscrobbler.com/2.0/?method=artist.getInfo'
        + '&artist=' + encodeURIComponent(artist).replace(/%20/g, '+')
        + '&username=' + lastfmNickname
        + '&api_key=' + lastfmAPIKey
        + '&format=json'
    ;
    console.log(url);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onloadend = function () {
        //console.log(this.response);
        var response = this.response;
        document.querySelectorAll('dl.artist[data-artist="' + artist +'"]').forEach(function (artistDl) {
            var el;
            if (response.error === undefined) {
                artistDl.querySelector('dd.artist-tags').innerText = '';
                artistDl.querySelector('dd.artist-userplaycount').innerText = '';
                el = document.createElement("a");
                el.className = "yt-simple-endpoint yt-formatted-string";
                el.target = '_blank';
                el.href = response.artist.url;
                el.textContent = response.artist.name;
                artistDl.querySelector('dt').textContent = '';
                artistDl.querySelector('dt').appendChild(el);

                if (response.artist.tags.tag.length > 0) {
                    for (var t in response.artist.tags.tag) {
                        artistDl.querySelector('dd.artist-tags').innerText += (artistDl.querySelector('dd.artist-tags').innerText == '' ? '' : ', ') + response.artist.tags.tag[t].name.toLowerCase();
                    }
                }

                if (parseInt(response.artist.stats.userplaycount) > 0) {
                    el = document.createElement("a");
                    el.className = "yt-simple-endpoint yt-formatted-string";
                    el.target = '_blank';
                    el.textContent = response.artist.stats.userplaycount + ' userplaycount(s)';
                    el.href = 'https://www.last.fm/user/' + lastfmNickname + '/library/music/' + encodeURIComponent(response.artist.name).replace(/%20/g, '+');
                    artistDl.querySelector('dd.artist-userplaycount').appendChild(el);
                }
            } else {
                artistDl.querySelector('dd.artist-tags').innerText = 'error ' + response.error + ' - ' + response.message;
            }
        });
    }
    xhr.send();
}

function getAlbumData() {
    document.querySelector('div.metadata').querySelector('#description').style.webkitLineClamp = '20';
    document.querySelector('div.metadata').querySelector('#description').style.maxHeight = 'fit-content';
    document.querySelector('div.metadata').querySelector('#description').style.maxWidth = 'fit-content';
    document.querySelector('div.metadata').querySelector('#description').contentEditable = true;

    var descrFirstChild = document.querySelector('div.metadata').querySelector('#description').firstChild;
    if (descrFirstChild.className != 'descr-pre') {
        descrFirstChild = document.createElement('pre');
        descrFirstChild.className = 'descr-pre';
        document.querySelector('div.metadata').querySelector('#description').insertBefore(descrFirstChild, document.querySelector('div.metadata').querySelector('#description').firstChild);
    } else {
        descrFirstChild.innerText = '';
    }

    const albumDetailsArr = document.querySelectorAll('yt-formatted-string.style-scope.ytmusic-detail-header-renderer');
    const artistYearArr = albumDetailsArr[1].textContent.split(" • ");

    const artist = artistYearArr[1];
    const year = artistYearArr[2];
    const title = albumDetailsArr[0].innerText;
    document.title = artist + ' - ' + title + ' (' + year + ')';

    const tracksMins = albumDetailsArr[2].innerText.replace(" songs •", "tracks").replace(" hour", "h").replace(" minutes", "min").replace(" seconds", "sec");

    const url =
        'https://ws.audioscrobbler.com/2.0/?method=artist.getInfo'
        + '&artist=' + encodeURIComponent(artist).replace(/%20/g, '+')
        + '&username=' + lastfmNickname
        + '&api_key=' + lastfmAPIKey
        + '&format=json'
    ;
    console.log(url);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onloadend = function () {
        var resultStr;
        if (this.response.error === undefined) {
            resultStr = year + "\n" + tracksMins + "\n";
            console.log(this.response.artist.url);
            var tags = '';
            if (this.response.artist.tags.tag.length > 0) {
                for (var t in this.response.artist.tags.tag) {
                    tags += (tags == '' ? '' : ', ') + this.response.artist.tags.tag[t].name.toLowerCase();
                }
            }
            console.log(tags);
            resultStr += tags + "\n";
        } else {
            console.log('this.response.error', this.response.error);
            resultStr = artist + ' last.fm error#' + this.response.error + ' - ' + this.response.message;
        }
        document.querySelector('div.metadata').querySelector('#description').querySelector('.descr-pre').innerText = resultStr;
    }
    xhr.send();
}

document.onmouseover = function(event){
    var elem = event.target;

    if (elem.tagName == 'YTMUSIC-RESPONSIVE-LIST-ITEM-RENDERER') {
        //elem.title = "\nclassName: " + elem.className;
        var title = elem.querySelector('.title-column').querySelector('.title').title;
        //elem.title += "\ntitle: " + title;
        var secondaryFlexColumns0FlexColumnTitle = elem.querySelector('.secondary-flex-columns').querySelectorAll('.flex-column')[0].title;
        //elem.title += "\nsecondaryFlexColumns0FlexColumnTitle: " + secondaryFlexColumns0FlexColumnTitle;
        var artist = secondaryFlexColumns0FlexColumnTitle;
        if (secondaryFlexColumns0FlexColumnTitle == '' && document.querySelectorAll('yt-formatted-string.style-scope.ytmusic-detail-header-renderer')) {
            var albumDetailsArr = document.querySelectorAll('yt-formatted-string.style-scope.ytmusic-detail-header-renderer');
            var artistYearArr = albumDetailsArr[1].textContent.split(" • ");
            var artistYearArr1 = artistYearArr[1];
            artist = artistYearArr1;
        }
        //elem.title += "\nartistYearArr1: " + artistYearArr1;
        //elem.title += "\nartist: " + artist;
        elem.title = artist + " - " + title;
        //elem.style.borderRight = '3px solid #b90000';
    }
}

document.body.onclick = function(event){
    /*document.getElementById('browse-page').querySelector('.subtitle').lastChild.onclick */
    console.log(event.target.tagName, event.target.className, event.target.parentNode.tagName, event.target.parentNode.className);
    if (event.target.tagName == 'SPAN' && event.target.className == 'style-scope yt-formatted-string'
        && event.target.parentNode.tagName == 'YT-FORMATTED-STRING' && event.target.parentNode.className == 'subtitle style-scope ytmusic-detail-header-renderer'
    ) {
        const documentLocationHref = new URL(document.location.href);
        const listParam = documentLocationHref.searchParams.get('list');
        console.log('listParam:', listParam);
        const gAPIurl = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&key=AIzaSyAFoISkwrca6mDMaIJc9kpfIr0OJNknlG4&playlistId=' + listParam;
        console.log('gAPIurl:', gAPIurl);

        const xhr = new XMLHttpRequest();
        xhr.open("GET", gAPIurl, true);
        xhr.responseType = "json";
        xhr.onloadend = function () {
            document.getElementById('browse-page').querySelector('.subtitle').lastChild.innerText = '';
            var releasedOnArr = [];
            this.response.items.forEach(item => {
                console.log(item.snippet.description);
                var releasedOn = /Released on: (.*?)\n/.exec(item.snippet.description);
                console.log('releasedOn', releasedOn);
                if (releasedOn && releasedOnArr.indexOf(releasedOn[1]) < 0) {
                    document.getElementById('browse-page').querySelector('.subtitle').lastChild.innerText += releasedOn[1];
                    releasedOnArr.push(releasedOn[1]);
                }
            });
        }
        xhr.send();
    }
}

/*main();*/