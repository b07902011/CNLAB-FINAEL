const stream = ( socket ) => {
    socket.on('subscribe', (data) => {
        console.log('on subscribe, ', 'room: ', data.room, " id: ", data.socketId);
        //subscribe/join a room
        socket.join( data.room );
        socket.join( data.socketId );

        //Inform other members in the room of new user's arrival
        if (socket.adapter.rooms.has(data.room) === true) {
            console.log('emit new user');
            socket.to( data.room ).emit( 'new user', { socketId: data.socketId } );
        }
    } );


    socket.on( 'newUserStart', ( data ) => {
        socket.to( data.to ).emit( 'newUserStart', { sender: data.sender } );
    } );


    socket.on('sdp', (data) => {
        console.log('on sdp, ', 'to: ', data.to, ' sender: ', data.sender);
        socket.to( data.to ).emit( 'sdp', { description: data.description, sender: data.sender } );
    } );


    socket.on( 'ice candidates', ( data ) => {
        socket.to( data.to ).emit( 'ice candidates', { candidate: data.candidate, sender: data.sender } );
    } );


    socket.on( 'chat', ( data ) => {
        socket.to( data.room ).emit( 'chat', { sender: data.sender, msg: data.msg } );
    } );
};

module.exports = stream;
