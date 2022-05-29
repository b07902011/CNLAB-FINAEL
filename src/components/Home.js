import { Input, Button } from '@material-ui/core';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const  generateRandomString = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

export const Home = () => {
    const [room, setRoom] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const handleCreateRoom = () => {
        navigate(name + '_' + generateRandomString(16));
    }
    const handleEnterRoom = () => {
        navigate(room);
    }
    return (
        <div>
            <Input placeholder="room name" onChange={(e) => setName(e.target.value)} />
            <Button onClick={handleCreateRoom} disabled={name.length === 0}>Create a room</Button>
            <Input placeholder="room id" onChange={(e) => setRoom(e.target.value)} />
            <Button onClick={handleEnterRoom} disabled={room.length === 0}>Enter a room</Button>
        </div>
    )
}