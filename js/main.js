 var Video = {

    token: "",

    // google developer key
    dev_key: 'AI39si42NBA6wmYf8wZ34r6170PvoZRO9_Wyw1pEMsMaTqFJfO_pY4KBQrLbPajd_DDwUfDKKQxYGTc5-duyONIQUpBlLR31_g',

    url: "https://gdata.youtube.com/feeds/api/",

    init: function() {
      if (window.location.hash) { // check if oauth2 token is in url
        $.ajax({
          url: 'https://www.googleapis.com/oauth2/v1/tokeninfo?' + window.location.hash.substring(1),
          success: Video.getVideo()
        });
      }
    },

    getVideo: function() {
      // get access token from url
      var access_token = window.location.hash.substring(1);
      console.log(access_token);

      // remove data that is not access token
      var position = window.location.hash.search('&') - 1;
      var str_length = access_token.length - position;
      access_token = access_token.substring(0, access_token.length - str_length);
      console.log(access_token);
      raw_token = access_token.substring(access_token.search('=')+1, access_token.length);
      this.token = raw_token;

      // get logged in user's playlists
      $.get(this.url + 'users/default/playlists?v=2&' + access_token + '&alt=json-in-script&callback=Video.showPlaylistTitles');
    },

    showPlaylistTitles: function(data) {
      $('#content a').hide();
      var playlist = [];
      var playlistId = [];
      for (item in data.feed.entry) {
        playlist.push(data.feed.entry[item].content.src);
        console.log(data.feed.entry[item].yt$playlistId);
        playlistId.push(data.feed.entry[item].yt$playlistId.$t);
        $('#playlist_titles ul').append('<li><a href="#" id="' + item + '">' + data.feed.entry[item].title.$t + '</a></li>');
      }
      this.showMyVideos(data, playlist, playlistId);
    },

    showMyVideos: function(data, playlist, playlistId) {
      
      $('#playlist_titles a').each(function() {
        $(this).on('click', function(e) {
          e.preventDefault();
          var id = $(this).attr('id');
          Video.getPlaylist(playlist[id], playlistId[id]);
        });
      });
    },

    getPlaylist: function(plist, plistId) {
      // get playlist
      console.log("playlist is " + plist);
      console.log("playlist id is" + plistId);
      var plistId = plistId.substring(2, plistId.length);
      console.log("new playlist id is " + plistId);
      $.get(plist + '&alt=json-in-script&callback=Video.showPlaylist');
      $('input.url_btn').on('click', function(e) {
        e.preventDefault();
        console.log("posting to playlist");
        var videoId = $('input.url_text').val();
        console.log(Video.token);
        var vidId = {
            "video":
              {
                "id": "me21QEpg760"
              }
          };
        console.log(typeof(vidId));
        //var playlist_video_entry = yt_service.AddPlaylistVideoEntryToPlaylist(plist, videoId);
        /*if isinstance(playlist_video_entry, gdata.youtube.YouTubePlaylistVideoEntry) {
          console.log('Video added');*/
          //"https://gdata.youtube.com/feeds/api/playlists/" + plistId
        $.ajax({
          type: 'POST',
          url:  plist + '?v=2&alt=jsonc',
          data: vidId,
          dataType: 'jsonc',
          //url: 'https://www.youtube.com/v/ECp_O_rRH5Q?version=3&f=' + plistId + '&app=youtube_gdata',
          //url: 'http://gdata.youtube.com/feeds/api/playlists/' + plistId + '&alt=jsonc',
          beforeSend: function(xhr){
            console.log(Video.token);
            console.log(Video.dev_key);
            xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
            xhr.setRequestHeader('Authorization', 'AuthSub token="' + Video.token + '"');
            xhr.setRequestHeader('X-GData-Key', 'key="' + Video.dev_key + '"');
            xhr.setRequestHeader('GData-Version', 2);
          },
          scope: 'https://gdata.youtube.com',
          error: function(data, textStatus, errorThrown) {
            console.log(data);
          }
        });
      });
    },

    showPlaylist: function(data) {
      console.log(data.feed.entry.length);

      // show first video in playlist
      $('#videos iframe').attr('src', data.feed.entry[0].content.src);

      // get list of videos in playlist. Only display videos that are not restricted
      var got_li = $('#playlist li');
      if (got_li.length>0) {
          $(got_li).parent().empty();
      }
      console.log(data.feed);
      for (vid in data.feed.entry) {
        console.log(data.feed.entry[vid]);
        if (data.feed.entry[vid].content) {
          var videoId = data.feed.entry[vid].media$group.yt$videoid.$t;

          // build playlist
          $('#playlist ul').append('<li><a id="' + videoId + '" href="#">' +
           data.feed.entry[vid].title.$t + '</a></li>');
        }
        else {
          console.log('it is restricted');
          continue;
        }
      }
      
      // show video in iframe
      $('#playlist a').each(function() {
        $(this).on('click', function() {
          var plist_id = $(this).attr('id');
          var video_url = 'https://www.youtube.com/v/' + plist_id + '?version=3&f=playlists&app=youtube_gdata';
          $('#videos iframe').attr('src', video_url);
        });
      });

    }
}



Video.init();

