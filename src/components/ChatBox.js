import { Input, Button, List } from '@material-ui/core';
import React, { useState } from "react";
import { Message } from "./Message";

export const ChatBox = ({ messages, sendMessage }) => {
    const [message, setMessage] = useState('');
    const [onSendMessage, setOnSendMessage] = useState(false);
    const handleSendMessage = () => {
        setOnSendMessage(true);
        sendMessage(message);
        setMessage('');
        setOnSendMessage(false);
    }
    return (
        <div>
            <List>
                {messages.map((m, index) => (
                    <Message data={m} index={index} key={index}/>
                ))}
            </List>
            <Input placeholder="enter your message" value={message} onChange={(e)=>setMessage(e.target.value)}/>
            <Button disabled={onSendMessage} onClick={handleSendMessage}>send message</Button>
        </div>
    );
}