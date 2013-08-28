// model
var AppModel = Backbone.Model.extend({
  urlRoot: '/yt-playlist-viewer',
  defaults: {
    plistId: 'id',
    idNum: 0,
    plistTitle: 'title'
  }
});
var appModel = new AppModel();
  //{ plistId: 'id', idNum: 0, plistTitle: 'title' }
//);
//appModel.save();
// collection model
var AppList = Backbone.Collection.extend({
  model: appModel,
  url: '/yt-playlist-viewer'
});
var appList = new AppList();


// view
var AppView = Backbone.View.extend({
  template: _.template('<li><a class="pl_list" href="#playlists/<%= plistId %>" id="<%= idNum %>"><%= plistTitle %></a></li>'),
  el: $('.showPlaylists'),
  //tagName: 'ul',
  className: 'showPlaylists',

  initialize: function() {
    console.log('initializing view');
    this.listenTo(this.model, 'change', this.render);
  },
  
  events: {
    'click .pl_list': 'getPlaylist',
    'click .videoName': 'showTrack'
  },

  /*initialize: function() {
    this.model.on('change', this.render, this);
    //this.model.on('destroy', this.remove, this);
  },*/
  
  render: function() {
    //var attributes = this.model.toJSON();
    //console.log("attributes are " + attributes);
    console.log("html is " + this.$el.html());
    this.$el.html(this.template(this.model.attributes));
    return this;
  },
  remove: function() {
    this.$el.remove();
  }

});
var appView = new AppView({model: appModel, el: $('.showPlaylists')});
//appView.render();
/*var showView = appView.el;
for (member in showView) {
  console.log("objects in el are " + showView[member]);
} */
console.log('tag name is ' + appView.el);

var TrackView = Backbone.View.extend({
  template: _.template('<li><a class="videoName" id="<%= videoId %>" href="#playlists/<% plistId %>/<%= videoId %>"><%= videoTitle %></a></li>')

  /*events: {
    ''
  },*/

});

// collection view
var AppListView = Backbone.View.extend({

  initialize: function() {
    this.collection.on('add', this.addOne, this);
  },

  addOne: function(appModel) {
      var appView = new AppView({model: appModel});
      console.log('looping through app view' + appView.$el.html());
      this.$el.append(appView.render().el);
  },

  render: function() {
    console.log('looping over collection');
    /*this.collection.each(function(plist) {
      console.log("looping over collection " + plist);
    });*/
    this.collection.forEach(this.addOne, this);
    return this;
  }
  
});

var appListView = new AppListView({collection: appList, el: $('.showPlaylists')});
//appListView.render();
//console.log("rendering app list" + appListView.el);


//Router 
var Video = new (Backbone.Router.extend({

  initialize: function() {
    console.log('initializing router');
    this.appList = new AppList();
    this.appListView = new AppListView({collection: this.appList});
    $('ul.showPlaylists').append(this.appListView.el);
  },

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
    this.appList.fetch();
    $('.showPlaylists').html(this.appListView.render().el);
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
      var playlistItems = response.result.items,
      playlistArray = [];
      console.log(playlistItems);
      var app_model = {};
      for (item in playlistItems) {
        console.log(playlistItems[item].id);
        // set model values
        console.log('appModel' + item);
        app_model["appModel" + item] = new AppModel();
        app_model["appModel" + item].set({plistId: playlistItems[item].id, idNum: item, plistTitle: playlistItems[item].snippet.title });
        appList.add(app_model["appModel" + item]);
        console.log("json is " + app_model["appModel" + item].toJSON());
        console.log("getting model " + app_model["appModel" + item].get('plistTitle'));
        //$('#playlist_titles ul').append('<li><a class="pl_list" href="#playlists/' + playlistItems[item].id + '" id="' + item + '">' + playlistItems[item].snippet.title + '</a></li>');
        //appListView.render();
        playlistArray.push(playlistItems[item].id);
      }
      console.log("app list is " + appList.toJSON());
      console.log("fetching list " + appList.fetch());
      console.log("app length is " + appList.length);
      appList.forEach(function(appModel) {
        console.log('looping through models ' + appModel.get('plistTitle'));
      });
  
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


