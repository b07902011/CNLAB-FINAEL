import React, { useEffect, useRef, useState } from "react";
import io from 'socket.io-client'
import useDynamicRefs from 'use-dynamic-refs';
import Peer from 'simple-peer';
import { VideoPlayer } from "./VideoPlayer";
import { useParams } from "react-router-dom";

export const ChatRoom = () => {
    const [socketId, setSocketId] = useState(null);
    const [socket, setSocket] = useState(io('http://localhost:5000'));
    const { room } = useParams();
    const [getRef, setRef] = useDynamicRefs();
    const peers = useRef({})
    // const [getPeers, setPeers] = useDynamicRefs();
    const [stream, setStream] = useState();
    const [pc, setPc] = useState([]);
    const [isInit, setIsInit] = useState(false);

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
                    switch ( peer._pc.iceConnectionState ) {
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
                    switch ( peer._pc.signalingState ) {
                        case 'closed':
                            console.log( "Signalling state is 'closed'" );
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
                    switch ( peers.current[sender]._pc.iceConnectionState ) {
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
                    switch ( peers.current[sender]._pc.signalingState ) {
                        case 'closed':
                            console.log( "Signalling state is 'closed'" );
                            removePeer(sender);
                            break;
                    }
                };
            });
        }
    }, [socketId, stream])

    return (<div>
        room Id : {room}
        <video playsInline muted ref={setRef('myVideo')} autoPlay />
        {pc.map((id) => (
            <VideoPlayer  Ref={setRef(id)}/>
        ))}
    </div>);
}