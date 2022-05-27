import React, { useEffect, useState } from "react";
import webSocket from 'socket.io-client'
import useDynamicRefs from 'use-dynamic-refs';

const getIceServer = () => ({
    iceServers: [
        {
            urls: ["stun:eu-turn4.xirsys.com"]
        },
        {
            username: "ml0jh0qMKZKd9P_9C0UIBY2G0nSQMCFBUXGlk6IXDJf8G2uiCymg9WwbEJTMwVeiAAAAAF2__hNSaW5vbGVl",
            credential: "4dd454a6-feee-11e9-b185-6adcafebbb45",
            urls: [
                "turn:eu-turn4.xirsys.com:80?transport=udp",
                "turn:eu-turn4.xirsys.com:3478?transport=tcp"
            ]
        }
    ]
});

export const Video = () => {
    const [socketId, setSocketId] = useState('');
    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState('test');
    const [getRef, setRef] = useDynamicRefs();
    const [stream, setStream] = useState();
    const [pc, setPc] = useState([]);
    const [Peers, setPeers] = useState([]);

    const closeVideo = (partnerName) => {
        setPeers((draft) => {
            const newDraft = [...draft];
            newDraft.slice(partnerName, 1);
            return newDraft;
        });
        setPc((draft) => {
            const newDraft = [...draft];
            newDraft.slice(newDraft.indexOf(partnerName), 1);
            return newDraft;
        });
    }

    console.log(Peers);

    const init = (createOffer, partnerName) => {
        if (pc.indexOf(partnerName) < 0) {
            setPeers((draft) => {
                const newDraft = [...draft];
                newDraft[partnerName] = new RTCPeerConnection(getIceServer());
                console.log('new', newDraft);
                return newDraft;
            });

            console.log('peers', Peers);

            if (stream) {
                stream.getTracks().forEach((track) => {
                    console.log(Peers[partnerName]);
                    Peers[partnerName].addTrack(track, stream);//should trigger negotiationneeded event
                });
            }




            //create offer
            if (createOffer) {
                Peers[partnerName].onnegotiationneeded = async () => {
                    const offer = await Peers[partnerName].createOffer();

                    await Peers[partnerName].setLocalDescription(offer);

                    socket.emit('sdp', { description: Peers[partnerName].localDescription, to: partnerName, sender: socketId });
                };
            }



            //send ice candidate to partnerNames
            Peers[partnerName].onicecandidate = ({ candidate }) => {
                socket.emit('ice candidates', { candidate: candidate, to: partnerName, sender: socketId });
            };



            //add
            Peers[partnerName].ontrack = (e) => {
                const str = e.streams[0];
                getRef(partnerName).srcObject = str;
            };



            Peers[partnerName].onconnectionstatechange = (d) => {
                switch (Peers[partnerName].iceConnectionState) {
                    case 'disconnected':
                    case 'failed':
                    case 'closed':
                        closeVideo(partnerName)
                        break;
                }
            };



            Peers[partnerName].onsignalingstatechange = (d) => {
                switch (Peers[partnerName].signalingState) {
                    case 'closed':
                        console.log("Signalling state is 'closed'");
                        closeVideo(partnerName)
                        break;
                }
            };
        }
    }

    useEffect(() => {
        const w = webSocket('http://localhost:5000');
        // @ts-ignore
        setSocket(w);
        navigator.mediaDevices.getUserMedia( {
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        } ).then((currentStream) => {
            setStream(currentStream);
            const ref = getRef('myVideo');
            ref.current.srcObject = currentStream;
          });
    }, []);

    useEffect(() => {
        if (socketId && stream) {
            socket.emit('subscribe', {
                // @ts-ignore
                room: room,
                socketId: socketId
            });
            
            socket.on('new user', (data) => {
                console.log('new user: ', data.socketId);
                console.log('sender: ', socketId);
                socket.emit('newUserStart', { to: data.socketId, sender: socketId });
                setPc((draft) => {
                    const newDraft = [...draft]
                    newDraft.push(data.socketId);
                    return newDraft;
                });
                init( true, data.socketId );
            });
            
            socket.on('newUserStart', (data) => {
                console.log('on newUserStart ', data.sender);
                setPc((draft) => {
                    const newDraft = [...draft]
                    newDraft.push(data.sender);
                    return newDraft;
                });
                init( false, data.sender );
            });
            
            socket.on('ice candidates', async (data) => {
                console.log('on ice candidates');
                if (data.candidate)
                    await Peers[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate));
            });
            
            socket.on('sdp', async (data) => {
                console.log('on sdp');
                if ( data.description.type === 'offer' && data.description) {
                    await Peers[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
                    
                    stream.getTracks().forEach( ( track ) => {
                        pc[data.sender].addTrack( track, stream );
                    } );

                    let answer = await pc[data.sender].createAnswer();

                    await Peers[data.sender].setLocalDescription( answer );

                    socket.emit( 'sdp', { description: pc[data.sender].localDescription, to: data.sender, sender: socketId } );
                }

                else if ( data.description.type === 'answer' ) {
                    await Peers[data.sender].setRemoteDescription( new RTCSessionDescription( data.description ) );
                }
            } );
        }
    }, [socketId, stream]);

    useEffect(() => {
        if (socket) {
            // @ts-ignore
            socket.on("connect", () => {
                // @ts-ignore
                setSocketId(socket.id);
            });
        }
    }, [socket])

    // console.log(pc);

    return (<div>
        {socketId}
        <video playsInline muted ref={setRef('myVideo')} autoPlay />
        {pc.map((name) => (
            <video key={`video-${name}`} playsInline ref={setRef(name)} autoPlay />
        ))}
    </div>);
}