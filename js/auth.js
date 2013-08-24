Backbone.sync = function(method, model, options) {
  switch (method) {
    case 'create':
      googleAPI.create(model, options);
    break;

    case 'update':
      googleAPI.update(model, options);
    break;

    case 'delete':
      googleAPI.destroy(model, options);
    break;

    case 'read':
      // The model value is a collection in this case
      googleAPI.list(model, options);
    break;

    default:
      // Something probably went wrong
      console.error('Unknown method:', method);
    break;
  }
};

var OAUTH2_CLIENT_ID = '222225811576.apps.googleusercontent.com';
var OAUTH2_SCOPES = [
  'https://www.googleapis.com/auth/youtube'
];

googleApiClientReady = function() {
  gapi.auth.init(function() {
    window.setTimeout(checkAuth, 1);
  });
};

function checkAuth() {
  gapi.auth.authorize({
    client_id: OAUTH2_CLIENT_ID,
    scope: OAUTH2_SCOPES,
    immediate: true
  }, handleAuthResult);
}

function handleAuthResult(authResult) {
  if (authResult) {
    $('.pre-auth').hide();
    loadAPIClientInterfaces();
  }
  else {
    $('#login-link').click(function() {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
      }, handleAuthResult);
    });
  }
}

function loadAPIClientInterfaces() {
  gapi.client.load('youtube', 'v3', function() {
    Video();
  });
}
