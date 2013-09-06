// model
var AppModel = Backbone.Model.extend({
  urlRoot: '/yt-playlist-viewer'
});
//var appModel = new AppModel();
// collection model
//var AppList = Backbone.Collection.extend({
  //model: appModel
  //url: '/yt-playlist-viewer'
//});
//var appList = new AppList();

// view
var AppView = Backbone.View.extend({
  template: _.template('<li><a data-id="<%= plistId %>" class="pl_list" href="#playlists/<%= plistId %>" id="<%= idNum %>"><%= plistTitle %></a></li>'),
  //el: $('.showPlaylists'),
  tagName: 'ul',
  className: 'showPlaylists',

  initialize: function() {
    console.log('initializing view');
    $(this.el).unbind("click");
    this.listenTo(this.model, 'change', this.render);
    //this.model.on('change', this.render, this);
  },
  
  events: {
    'click .pl_list': 'open',
    'click .videoName': 'showTrack'
  },

  open: function(e) {
    e.preventDefault();
    var id = $(e.currentTarget).data("id");
    console.log("data attribute is " + id);
    Video.getPlaylist(id);
  },

  render: function() {
    console.log("html is " + this.$el.html());
    this.$el.append(this.template(this.model.attributes));
    //return this;
  }
});



var TrackView = Backbone.View.extend({
  template: _.template('<li><a class="videoName" id="<%= videoId %>" href="#playlists/<% plistId %>/<%= videoId %>"><%= videoTitle %></a></li>')

  /*events: {
    ''
  },*/

});

// Router 
var Video = new (Backbone.Router.extend({

  initialize: function() {
    console.log('initializing router');
  },

  routes: {
    '': 'index',
    'playlists/:plist': 'getPlaylist',
    'playlists/:plist/:videoId': 'showTrack'
  },

  /*index: function() {
    console.log('index loaded');
    this.appList.fetch();
    $('.showPlaylists').html(this.appListView.render().el);
    this.handleAPILoaded();
  },*/

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
      var app_model = {};
      var app_view = {};
      for (item in playlistItems) {
        // set model values
        console.log('appModel' + item);  
        app_model["appModel" + item] = new AppModel();
        app_model["appModel" + item].set({plistId: playlistItems[item].id, idNum: item, plistTitle: playlistItems[item].snippet.title });
        app_model["appModel" + item].fetch();
        app_model["appModel" + item].save();
        //appList.add(app_model["appModel" + item]);
        console.log("this is the playlist id " + app_model["appModel" + item].get('plistId'));
        app_view["appView" + item] = new AppView({model: app_model["appModel" + item], el: $('.showPlaylists')});
        var appView = new AppView({model: app_model["appModel" + item]});
        app_view["appView" + item].render();
        console.log('appView' + item);
        //console.log("json is " + appList.toJSON());
        console.log("getting model " + app_model["appModel" + item].get('plistTitle'));
        playlistArray.push(playlistItems[item].id);
      }
    });

  },

  getPlaylist: function(plist) {
      //console.log(" the link that is clicked is " + this.$el.html())
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
          $('#playlist ul').append('<li><a class="videoName" id="' + playlistTracks[vid].snippet.resourceId.videoId + '" href="' + '#playlists/' + plist + '/' + playlistTracks[vid].snippet.resourceId.videoId + '">' +
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
  Backbone.history.start({pushState: true});
});