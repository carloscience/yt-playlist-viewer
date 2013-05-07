var Video = {

  handleAPILoaded: function() {
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
        $('#playlist_titles ul').append('<li><a href="#" id="' + item + '">' + playlistItems[item].snippet.title + '</a></li>');
        playlistArray.push(playlistItems[item].id);
      }
      $('#playlist_titles a').on('click', function(e) {
        e.preventDefault();
        console.log('clicked playlist');
        var id = $(this).attr('id');
        Video.getPlaylist(playlistArray[id]);
      });
    });

  },

  getPlaylist: function(plist) {

      // get playlist
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
          $('#playlist ul').append('<li><a id="' + playlistTracks[vid].snippet.resourceId.videoId + '" href="#">' +
           playlistTracks[vid].snippet.title + '</a></li>');
        }

        $('#playlist a').each(function() {
          $(this).on('click', function() {
            var video_id = $(this).attr('id');
            var video_url = 'http://www.youtube.com/embed/' + video_id;
            $('#videos iframe').attr('src', video_url);
          });
        });

      });
      this.addToPlaylist(plist);
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

};



