let express = require( 'express' );
let app = express();
let server = require('http').Server(app);
let cors = require('cors');
let io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
    }
});
let stream = require('./ws/stream');
let path = require( 'path' );
app.use( '/static', express.static( path.join( __dirname, 'build', 'static') ) );
app.get( '/', ( req, res ) => {
    res.sendFile( __dirname + '/build/index.html' );
});
app.get( '/room/*', ( req, res ) => {
    res.sendFile( __dirname + '/build/index.html' );
} );
io.of( '/stream' ).on( 'connection', stream );
console.log('socket server on');
server.listen( 3000 );