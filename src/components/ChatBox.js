import { Input, Button, List } from '@material-ui/core';
import { Paper } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React, { useState } from "react";
import { MessageLeft, MessageRight} from "./Message";
import { TextInput } from "./TextInput.js";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      width: "80vw",
      height: "140vh",
      maxWidth: "350px",
      maxHeight: "600px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative"
    },
    paper2: {
      width: "80vw",
      maxWidth: "500px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative"
    },
    container: {
      width: "100vw",
      height: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    messagesBody: {
      width: "calc( 100% - 20px )",
      margin: 10,
      overflowY: "scroll",
      height: "calc( 100% - 80px )"
    }
  })
);

export const ChatBox = ({ messages, sendMessage, user}) => {
    const [message, setMessage] = useState('');
    const [onSendMessage, setOnSendMessage] = useState(false);
    const handleSendMessage = () => {
        setOnSendMessage(true);
        sendMessage(message);
        setMessage('');
        setOnSendMessage(false);
    }
    const classes = useStyles();
    return (
        <div className={classes.container}>
            <Paper className={classes.paper} zDepth={2}>
                <Paper id="style-1" className={classes.messagesBody}>
                    {messages.map((m, index) => (
                        m.me ? <MessageRight data={m} index={index} key={index}/> : <MessageLeft data={m} index={index} key={index}/>
                    ))}
                </Paper>
                <TextInput message={message} setMessage={setMessage} onSendMessage={onSendMessage} handleSendMessage={handleSendMessage}/>
            </Paper>
        </div>
    );
}