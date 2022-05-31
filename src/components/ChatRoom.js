import React, { useContext, useEffect, useRef, useState } from "react";
import io from 'socket.io-client'
import useDynamicRefs from 'use-dynamic-refs';
import Peer from 'simple-peer';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import GridList from "@material-ui/core/GridList";
import GridListTile from '@material-ui/core/GridListTile'
import Select from '@material-ui/core/Select';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { VideoPlayer } from "./VideoPlayer";
import { useParams } from "react-router-dom";
import { UserContext } from "./Context";
import { ChatBox } from "./ChatBox";
import { UserDialog } from "./UserDialog";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CkEditer } from "./CkEditer";
import { CodeEditer } from "./CodeEditer";

export const ChatRoom = () => {
    const [socketId, setSocketId] = useState(null);
    const [isChat, setIsChat] = useState(true);
    const [socket, setSocket] = useState(io('http://localhost:5000'));
    const { room } = useParams();
    const [getRef, setRef] = useDynamicRefs();
    const peers = useRef({})
    // const [getPeers, setPeers] = useDynamicRefs();
    const [stream, setStream] = useState();
    const [pc, setPc] = useState([]);
    const [isInit, setIsInit] = useState(false);
    const { name } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [ckContent, setCkContent] = useState('');
    const [code, setCode] = useState('int main()');

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                getRef('myVideo').current.srcObject = currentStream;
            });
        socket.on('connect', () => {
            console.log('socket connect', socket.id);
            setSocketId(socket.id)
        })
    }, []);

    const removePeer = (id) => {
        setPc((p) => {
            const newDraft = [...p];
            newDraft.splice(newDraft.indexOf(id), 1);
            return newDraft;
        });
        peers.current[id].destroy();
    };

    useEffect(() => {
        if (!isInit && socketId && stream) {
            setIsInit(true);
            console.log('id', socketId);
            console.log('stream', stream);
            socket.emit('subscribe', { room, socketId });
            socket.on('new user', ({ id }) => {
                console.log('new user', id);
                // setPeers(id);
                console.log(stream)
                const peer = new Peer({ initiator: true, trickle: false, stream });
                peer.on('signal', (data) => {
                    console.log('send signal', data);
                    socket.emit('send signal', { to: id, signal: data, sender: socketId });
                });
                peer.on('stream', (currentStream) => {
                    console.log(currentStream);
                    getRef(id).current.srcObject = currentStream;
                });
                peers.current[id] = peer;
                setPc((p) => {
                    const newDraft = [...p];
                    newDraft.push(id);
                    return newDraft;
                });
            });
            socket.on('send signal', ({ sender, signal }) => {
                console.log('receive signal', signal);
                // setPeers(sender);
                const peer = new Peer({ initiator: false, trickle: false, stream });
                peer.on('signal', (data) => {
                    console.log('return signal', data);
                    socket.emit('return signal', { signal: data, sender: socketId, to: sender });
                });
                peer.on('stream', (currentStream) => {
                    console.log(currentStream);
                    getRef(sender).current.srcObject = currentStream;
                });

                peer._pc.onconnectionstatechange = () => {
                    switch (peer._pc.iceConnectionState) {
                        case 'disconnected':
                        case 'failed':
                        case 'closed':
                            console.log('connection failed');
                            removePeer(sender);
                            break;
                    }
                };
                peer._pc.onsignalingstatechange = () => {
                    // console.log(peer._pc.signalingState);
                    switch (peer._pc.signalingState) {
                        case 'closed':
                            console.log("Signalling state is 'closed'");
                            removePeer(sender);
                            break;
                    }
                };

                peer.signal(signal);
                
                peers.current[sender] = peer;
                setPc((p) => {
                    const newDraft = [...p];
                    newDraft.push(sender);
                    return newDraft;
                });
            });
            socket.on('return signal', ({ sender, signal }) => {
                // const ref = getPeers(sender);
                console.log('get return signal', signal);
                console.log(sender, peers.current[sender]);
                peers.current[sender].signal(signal);
                peers.current[sender]._pc.onconnectionstatechange = () => {
                    switch (peers.current[sender]._pc.iceConnectionState) {
                        case 'disconnected':
                        case 'failed':
                        case 'closed':
                            console.log('connection failed');
                            removePeer(sender);
                            break;
                    }
                };
                peers.current[sender]._pc.onsignalingstatechange = () => {
                    // console.log(peers.current[sender]._pc.signalingState);
                    switch (peers.current[sender]._pc.signalingState) {
                        case 'closed':
                            console.log("Signalling state is 'closed'");
                            removePeer(sender);
                            break;
                    }
                };
            });
            socket.on('message', (data) => {
                console.log('get message', data);
                setMessages((ms) => {
                    const newMs = [...ms];
                    newMs.push({...data, me:false});
                    return newMs;
                });
            });

            socket.on('code', (data) => {
                console.log('get code');
                setCode(data.code);
            });

            socket.on('editor content', (data) => {
                console.log('editor content');
                setCkContent(data.content);
            });
        }
    }, [socketId, stream]);

    const sendMessage = (content) => {
        setMessages((ms) => {
            const newMs = [...ms];
            newMs.push({ name, content, me:true });
            return newMs;
        })
        socket.emit('message', { room, name, content });
    };

    const onCodeChange = (c) => {
        setCode((pre) => {
            if (c !== pre)
                socket.emit('code', { room, code: c });
            return c;
        });
    }

    const onContentChange = (c) => {
        setCkContent((pre) => {
            if (c !== pre)
                socket.emit('editor content', { room, content: c });
            return c;
        });
    }
    const theme = createTheme();
    const cols = pc.length < 2 ? 1 : (pc.length % 2 === 1 ? 4/(pc.length + 1): 4/(pc.length + 2));

    return (
        <ThemeProvider theme={theme}>
          <Grid container component="main" >
            <CssBaseline />
            <Grid container xs={false} sm={4} md={8}>
                <GridList cellHeight={300}>
                    <GridListTile cols={cols}>
                        <video playsInline muted ref={setRef('myVideo')} autoPlay style={{width: "100%"}}/>
                    </GridListTile>
                    {pc.map((id) => (
                        <GridListTile cols={cols}>
                            <VideoPlayer  Ref={setRef(id)}/>
                        </GridListTile>
                    ))};
                </GridList>
            </Grid>
            <Grid item xs={12} sm={8} md={4} component={Paper} elevation={6}>
                <Typography component="h6" variant="h6" fontSize="10px">
                    room : {room}
                </Typography>
                <Typography component="h6" variant="h6" fontSize="10px">
                    id : {name}
                </Typography>
                <Select
                    native
                    value={isChat}
                    onChange={(e)=>setIsChat(e.target.value)}
                >
                    <option value="">Code Editor</option> />
                    <option value={true}>Chat Room</option>
                </Select>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Box component="form" sx={{ mt: 1 }}>
                        {isChat ? <ChatBox messages={messages} sendMessage={sendMessage} user={name} /> : <CodeEditer code={code} onChange={onCodeChange}/>} 
                    </Box>
                </Box>
            </Grid>
          </Grid>
          <UserDialog open={ name.length === 0}/>
        </ThemeProvider>
    );
    /*return (<div>
        room Id : {room} user : {name}
        <GridList cols={2} cellheight="auto">
            <video playsInline muted ref={setRef('myVideo')} autoPlay />
            {pc.map((id) => (
                <GridListTile key={id}>
                    <VideoPlayer  Ref={setRef(id)}/>
                </GridListTile>
            ))} 
        </GridList>
        <ChatBox messages={messages} sendMessage={sendMessage} user={name} />
        <CkEditer content={ckContent} onChange={onContentChange} />
        <CodeEditer code={code} onChange={onCodeChange}/>
        <UserDialog open={ name.length === 0}/>
    </div>);*/
}