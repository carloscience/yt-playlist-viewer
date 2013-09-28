// model
var AppModel = Backbone.Model.extend({
  urlRoot: '/yt-playlist-viewer'
});

// view
var AppView = Backbone.View.extend({
  //pass in playlist id and playlist title
  template: _.template('<li><a data-id="<%= plistId %>" class="pl_list" href="#playlists/<%= plistId %>" id="<%= idNum %>"><%= plistTitle %></a></li>'),
  //el: $('.showPlaylists'),
  tagName: 'ul',
  className: 'showPlaylists',

  initialize: function() {
    console.log('initializing view');
    // prevent click event from firing twice
    $(this.el).unbind("click");
    this.listenTo(this.model, 'change', this.render);
  },

  render: function() {
    // render the app model view
    console.log("html is " + this.$el.html());
    this.$el.append(this.template(this.model.attributes));
    //return this;
  }
});

var PlaylistView = Backbone.View.extend({
  // pass in video id, playlist id, and video title
  template: _.template('<li><a data-id="<%= videoId %>" data-list="<%= plistId %>" class="videoName" id="<%= videoId %>" href="#playlists/<%= plistId %>/<%= videoId %>"><%= videoTitle %></a></li>'),
  tagName: 'ul',
  className: 'showVideos',

  initialize: function() {
    console.log('initializing playlist sidebar view');
    $(this.el).unbind('click');
    this.listenTo(this.model, 'change', this.render);
  },

  render: function() {
    // render the playlist model view
    this.$el.append(this.template(this.model.attributes));
    //return this;
  }

});

// playlist model
var PlaylistModel = Backbone.Model.extend({
  urlRoot: '/yt-playlist-viewer/playlists'
});

// Router 
var Video = new (Backbone.Router.extend({

  initialize: function() {
    console.log('initializing router');
  },

  routes: {
    '': 'index',
    'playlists/:plistId': 'getPlaylist',
    'playlists/:plistId/:videoId': 'showTrack'
  },

  index: function() {
    console.log('index loaded');
    //this.appList.fetch();
    //$('.showPlaylists').html(this.appListView.render().el);
    this.handleAPILoaded();
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
      var playlistItems = response.result.items;
      //playlistArray = [];
      console.log(playlistItems);
      var app_model = {};
      var app_view = {};
      for (item in playlistItems) {
        // set model values
        console.log('appModel' + item);  
        app_model["appModel" + item] = new AppModel();
        app_model["appModel" + item].set({plistId: playlistItems[item].id, idNum: item, plistTitle: playlistItems[item].snippet.title });
        //appList.add(app_model["appModel" + item]);
        console.log("this is the playlist id " + app_model["appModel" + item].get('plistId'));
        app_view["appView" + item] = new AppView({model: app_model["appModel" + item], el: $('.showPlaylists')});
        var appView = new AppView({model: app_model["appModel" + item]});
        app_view["appView" + item].render();
        console.log('appView' + item);
        //console.log("json is " + appList.toJSON());
        console.log("getting model " + app_model["appModel" + item].get('plistTitle'));
        //playlistArray.push(playlistItems[item].id);
      }
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
        // set iframe source
        $('#videos iframe').attr('src', 'http://www.youtube.com/embed/' + playlistTracks[0].snippet.resourceId.videoId);
        var got_li = $('#playlist li');
        if (got_li.length>0) {
          $(got_li).parent().empty();
        }
        var playlist_model = {};
        var playlist_view = {};
        for (vid in playlistTracks) {
          // add playlist data to model
          playlist_model["playlistModel" + vid] = new PlaylistModel();
          playlist_model["playlistModel" + vid].set({videoId: playlistTracks[vid].snippet.resourceId.videoId, plistId: plist, videoTitle: playlistTracks[vid].snippet.title });
          console.log("getting subvideo id " + playlist_model["playlistModel" + vid].get('videoId'));
          playlist_view["playlistView" + vid] = new PlaylistView({model: playlist_model["playlistModel" + vid], el: $('.showVideos')});
          playlist_view["playlistView" + vid].render();
          console.log("getting submodel " + playlist_model["playlistModel" + vid].get('videoTitle'));
        }
      });
      this.addToPlaylist(plist);
  },

  showTrack: function(pl_list, id) {
    //console.log("current target is " + e);
    console.log("video id is " + id);
      //var id = $(e.currentTarget).data("id");
      if (!(id)) {
        var deeplink = window.location.hash.substring(1),
        first_slash = deeplink.indexOf('/'),
        last_slash = deeplink.lastIndexOf('/'),
        pl_list = deeplink.substring(first_slash+1, last_slash),
        id = deeplink.substring(last_slash+1);
      }
      this.navigate('playlists/' + pl_list + '/' + id);
      console.log("data attribute is " + id + " list is " + pl_list);
      var video_url = 'http://www.youtube.com/embed/' + id;
      console.log(video_url);
      // set iframe source
      $('#videos iframe').attr('src', video_url);
  },

  addToPlaylist: function(playlist) {
    // add youtube video to playlist
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
  Backbone.history.start({/*pushState: true*/});
});