//requirejs(['app']);



/*define(["jquery", "jquery.alpha", "jquery.beta"], function($) {
  $(function() {
    $('body').alpha().beta();
  });
});*/
//requirejs(['MyModel', 'plugins', 'auth']);


var Video = new (Backbone.Router.extend({

  routes: {
    '': 'index',
    'playlists/:plist': 'getPlaylist',
    'playlists/:plist/:videoId': 'showTrack'
  },

  /*initialize: function() {
    console.log('router initialized');
    this.index();
  },*/

  index: function() {
    console.log('index loaded');
    this.handleAPILoaded();
  },

  newpage: function() {
    console.log('newpage loaded');
  },

  handleAPILoaded: function() {
    console.log("loading api");
    this.requestPlaylists();
  },

  requestPlaylists: function() {
    // check var names
    var request = gapi.client.youtube.playlists.list({
      mine: true,
      part: 'snippet'
    });
    request.execute(function(response) {
      var playlistItems = response.result.items,
      playlistArray = [];
      console.log(playlistItems);

      for (item in playlistItems) {
        console.log(playlistItems[item].id);

        $('#playlist_titles ul').append('<li><a href="#playlists/' + playlistItems[item].id + '" id="' + item + '">' + playlistItems[item].snippet.title + '</a></li>');
        playlistArray.push(playlistItems[item].id);
      }
      $('#playlist_titles a').on('click', function(e) {
        e.preventDefault();
        console.log('clicked playlist');
        var id = $(this).attr('id');
        var title = $(this).text();
        console.log("title is " + title);
        Video.getPlaylist(playlistArray[id]);
      });
    });

  },

  getPlaylist: function(plist) {
      this.navigate('playlists/' + plist);
      // get playlist
      console.log('routing to playlist');
      console.log("playlist is " + plist);
      var request = gapi.client.youtube.playlistItems.list({
        part: 'snippet',
        playlistId: plist,
        maxResults: 10
      });
      request.execute(function(response) {
        console.log(response);
        var playlistTracks = response.result.items;
        $('#videos iframe').attr('src', 'http://www.youtube.com/embed/' + playlistTracks[0].snippet.resourceId.videoId);
        var got_li = $('#playlist li');
        if (got_li.length>0) {
          $(got_li).parent().empty();
        }
        for (vid in playlistTracks) {
          $('#playlist ul').append('<li><a id="' + playlistTracks[vid].snippet.resourceId.videoId + '" href="' + '#playlists/' + plist + '/' + playlistTracks[vid].snippet.resourceId.videoId + '">' +
           playlistTracks[vid].snippet.title + '</a></li>');
        }

        $('#playlist a').each(function() {
          $(this).on('click', function(e) {
            e.preventDefault();
            var video_id = $(this).attr('id');
            Video.showTrack(plist, video_id);
          });
        });
      });
      this.addToPlaylist(plist);
  },

  showTrack: function(plist, videoId) {
    console.log("now the playlist is " + plist);
    Video.navigate('playlists/' + plist + '/' + videoId);
    var video_url = 'http://www.youtube.com/embed/' + videoId;
    console.log(video_url);
    $('#videos iframe').attr('src', video_url);  
  },

  addToPlaylist: function(playlist) {
    $('#enter_url').show();
    $('input.url_btn').on('click', function(e) {
        e.preventDefault();
        console.log("posting to playlist");
        var ytvideo = $('input.url_text').val();
        var details = {
          videoId: ytvideo,
          kind: 'youtube#video'
        }
        var insert = gapi.client.youtube.playlistItems.insert({
          part: 'snippet',
          resource: {
            snippet: {
              playlistId: playlist,
              resourceId: details
            }
          }
        });
        insert.execute(function(response) {
          console.log(response);
          $('#ytfeature').html('<pre>' + JSON.stringify(response.result) + '</pre>');
        });
    });
  }      

}));
$(document).ready(function() {
  Backbone.history.start();
});


