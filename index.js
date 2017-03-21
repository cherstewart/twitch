'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('babel-polyfill');

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _koaRoute = require('koa-route');

var _koaRoute2 = _interopRequireDefault(_koaRoute);

var _koaStaticFolder = require('koa-static-folder');

var _koaStaticFolder2 = _interopRequireDefault(_koaStaticFolder);

var _marko = require('marko');

var _marko2 = _interopRequireDefault(_marko);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [index, overlay, dashboard, callback, spotify].map(regeneratorRuntime.mark);

_dotenv2.default.config();

var app = new _koa2.default();
var port = process.env.PORT || '8888';
var HOSTNAMES = {
    self: process.env.HOSTNAME || 'localhost:' + port,
    spotify: {
        api: 'api.spotify.com',
        auth: 'accounts.spotify.com'
    },
    google: {
        api: 'www.googleapis.com'
    }
};
var CLIENT_IDS = {
    spotify: {
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
    },
    google: {
        api_key: process.env.GOOGLE_API_KEY
    }
};
var state = Math.round(Math.pow(36, 33) - Math.random() * Math.pow(36, 32)).toString(36).slice(1);

app.use((0, _koaStaticFolder2.default)('./public')).use(_koaRoute2.default.get('/', index)).use(_koaRoute2.default.get('/connect/:client_id', spotify)).use(_koaRoute2.default.get('/connect/:client_id/callback', callback)).use(_koaRoute2.default.get('/dashboard/:id', dashboard)).use(_koaRoute2.default.get('/overlays/:id', overlay));

var server = _http2.default.createServer(app.callback());
var io = new _socket2.default(server);

function index() {
    var data;
    return regeneratorRuntime.wrap(function index$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    data = {
                        title: 'Cherp || Code Hitchhiker'
                    };


                    this.body = _marko2.default.load('./views/layouts/base.marko').stream(data);
                    this.type = 'text/html';

                case 3:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked[0], this);
}

function overlay(id) {
    var template, data;
    return regeneratorRuntime.wrap(function overlay$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    template = './views/overlays/_' + id + '.marko';
                    data = {
                        title: 'Cherp\'s Twitch Overlays',
                        id: id
                    };


                    this.body = _marko2.default.load(template).stream(data);
                    this.type = 'text/html';

                case 4:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked[1], this);
}

function dashboard(id) {
    var template, data;
    return regeneratorRuntime.wrap(function dashboard$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    template = './views/overlays/_' + id + '.marko';
                    data = {
                        title: 'Cherp\'s Twitch Overlays',
                        id: id
                    };


                    this.body = _marko2.default.load(template).stream(data);
                    this.type = 'text/html';

                case 4:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked[2], this);
}

io.on('connection', function (socket) {
    console.log('Socket open on server, listening for events.');

    socket.on('userConnectingToSpotify', function (data) {
        console.log(data.message);
    });

    socket.on('getAccessToken', function (object) {
        console.log('Retrieving access token for: ' + object.client);

        getAccessToken(object).then(function (data) {
            return getPlaylists(data, object);
        }).catch(function (err) {
            return console.log('Failed to get access token: ' + err);
        });
    });

    socket.on('getPlaylistTracks', function (object) {
        console.log('Retrieving tracks from: ' + object.client);

        getPlaylistTracks(object).then(function (data) {
            return io.emit('tracksReady', data);
        }).catch(function (err) {
            return console.log('Failed to get tracks: ' + err);
        });
    });

    socket.on('playTrack', function (object) {
        getYouTubeTrack(object).then(function (data) {
            return io.emit('trackLoaded', { data: object, id: JSON.parse(data).items[0].id.videoId });
        }).catch(function (err) {
            return console.log('Failed to get track: ' + err);
        });
    });
});

function callback(client) {
    return regeneratorRuntime.wrap(function callback$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:

                    io.emit(client.toString() + 'Connected', this);

                case 1:
                case 'end':
                    return _context4.stop();
            }
        }
    }, _marked[3], this);
}

function spotify() {
    var redirect_uri, url, data;
    return regeneratorRuntime.wrap(function spotify$(_context5) {
        while (1) {
            switch (_context5.prev = _context5.next) {
                case 0:
                    redirect_uri = 'http://' + HOSTNAMES.self + '/connect/spotify/callback';
                    url = 'https://' + HOSTNAMES.spotify.auth + '/authorize?client_id=' + CLIENT_IDS.spotify.client_id + '&response_type=code&redirect_uri=' + redirect_uri;
                    data = {
                        url: url
                    };


                    this.type = 'application/json';
                    this.body = data;

                case 5:
                case 'end':
                    return _context5.stop();
            }
        }
    }, _marked[4], this);
}

function getYouTubeTrack(object) {
    var options = {
        method: 'GET',
        hostname: HOSTNAMES.google.api,
        path: '/youtube/v3/search?maxResults=1&part=id%2Csnippet&q=' + _querystring2.default.escape(object.artist) + '%20' + _querystring2.default.escape(object.name) + '&key=' + CLIENT_IDS.google.api_key
    };

    return new Promise(function (resolve, reject) {

        var request = _https2.default.request(options, function (response) {
            var chunks = [];

            response.on('data', function (chunk) {
                chunks.push(chunk);
            });

            response.on('end', function () {
                var body = Buffer.concat(chunks);
                resolve(body.toString());
            });
        });

        request.on('error', function (err) {
            reject(err);
        });

        request.end();
    });
}

function getPlaylistTracks(object) {
    var userId = 'twitchfm';

    var options = {
        method: 'GET',
        hostname: HOSTNAMES.spotify.api,
        path: '/v1/users/' + userId + '/playlists/' + object.id + '/tracks'
    };

    options.headers = {
        "Authorization": object.auth
    };

    return new Promise(function (resolve, reject) {

        var request = _https2.default.request(options, function (response) {
            var chunks = [];

            response.on('data', function (chunk) {
                chunks.push(chunk);
            });

            response.on('end', function () {
                var body = Buffer.concat(chunks);
                resolve(body.toString());
            });
        });

        request.on('error', function (err) {
            reject(err);
        });

        request.end();
    });
}

function getAccessToken(object) {
    var redirect_uri = 'http://' + HOSTNAMES.self + '/connect/' + object.client + '/callback',
        path = '/api/token';

    var options = {
        method: 'POST',
        hostname: HOSTNAMES.spotify.auth,
        path: path
    };

    var body = _querystring2.default.stringify({
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri,
        code: object.code
    });

    options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        "Authorization": 'Basic ' + new Buffer(CLIENT_IDS.spotify.client_id + ':' + CLIENT_IDS.spotify.client_secret).toString('base64')
    };

    return new Promise(function (resolve, reject) {
        var request = _https2.default.request(options, function (response) {
            var chunks = [];

            response.on('data', function (chunk) {
                chunks.push(chunk);
            });

            response.on('end', function (data) {
                var body = Buffer.concat(chunks);
                resolve(body.toString());
            });
        });

        request.on('error', function (err) {
            reject(err);
        });

        request.write(body);

        request.end();
    });
}

function getPlaylists(data, object) {

    console.log('Loading playlists from: ' + object.client);

    var options = getPlaylistOptions(data, object);

    var collections = function collections(options) {
        return new Promise(function (resolve, reject) {

            var request = _https2.default.request(options, function (response) {
                var chunks = [];

                response.on('data', function (chunk) {
                    chunks.push(chunk);
                }).on('end', function () {
                    var body = Buffer.concat(chunks);
                    resolve({ data: body.toString(), auth: options.headers.Authorization });
                });
            });

            request.on('error', function (err) {
                reject(err);
            });

            request.end();
        });
    };

    collections(options).then(function (data) {
        return io.emit('playlistsReady', data);
    });
}

function getPlaylistOptions(data, object) {
    var options;

    data = JSON.parse(data);

    if (object.client == 'spotify') {
        var userId = 'twitchfm';

        options = {
            method: 'GET',
            hostname: HOSTNAMES.spotify.api,
            path: '/v1/users/' + userId + '/playlists'
        };

        options.headers = {
            "Authorization": data.token_type + ' ' + data.access_token
        };
    }

    return options;
}

server.listen(port, function () {
    return console.log('Listening on port:' + port);
});

exports.default = app;
