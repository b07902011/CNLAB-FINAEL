const stream = (socket) => {
    socket.on('subscribe', (data) => {
        console.log('on subscribe, ', 'room: ', data.room, " id: ", data.socketId);
        //subscribe/join a room
        socket.join( data.room );
        socket.join( data.socketId );

        //Inform other members in the room of new user's arrival
        if (socket.adapter.rooms.has(data.room) === true) {
            console.log('emit new user');
            socket.to( data.room ).emit( 'new user', { id: data.socketId } );
        }
    });



    socket.on( 'send signal', ( data ) => {
        socket.to( data.to ).emit( 'send signal', { sender: data.sender, signal: data.signal } );
    });
    
    socket.on( 'return signal', ( data ) => {
        socket.to( data.to ).emit( 'return signal', { sender: data.sender, signal: data.signal } );
    } );
};

module.exports = stream;
