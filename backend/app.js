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

io.on('connection', stream);
console.log('socket server on')

server.listen( 5000 );