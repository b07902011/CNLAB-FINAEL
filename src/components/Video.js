import React, { useEffect, useRef, useState } from "react";
import io from 'socket.io-client'
import useDynamicRefs from 'use-dynamic-refs';
import Peer from 'simple-peer';

export const Video = () => {
    const [socketId, setSocketId] = useState(null);
    const [socket, setSocket] = useState(io('http://localhost:5000'));
    const [room, setRoom] = useState('test');
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
                // const ref = getPeers(id);
                // console.log('ref', ref);
                // ref.current = {
                //     peer
                // }
                // console.log('ref', ref);
                // console.log(id, getPeers(id));
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
                peer.signal(signal);
                // const ref = getPeers(sender);
                // ref.current = {
                //     peer
                // };
                
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
            });
        }
    }, [socketId, stream])

    // console.log(pc);
    useEffect(() => {
        pc.forEach(id => {
            console.log(peers.current[id]);
        })
    }, [pc]);

    return (<div>
        <video playsInline muted ref={setRef('myVideo')} autoPlay />
        {pc.map((id) => (
            <video key={`${id}-video`} ref={setRef(id)} playsInline autoPlay/>
        ))}
    </div>);
}