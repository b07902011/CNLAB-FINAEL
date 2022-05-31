import React, { useState } from 'react';
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import IconButton from '@material-ui/core/IconButton';
import GridListTileBar from '@material-ui/core/GridListTileBar';

export const VideoPlayer = ({ Ref }) => {
    const [mute, setMute] = useState(false);
    console.log(mute);
    return (
        <div>
            <video ref={Ref} playsInline autoPlay muted={mute} style={{ width: "100%"}}/>
            <GridListTileBar
                titlePosition="top"
                actionPosition="left"
                actionIcon={
                    <IconButton aria-label="mute" size="medium" onClick={()=>setMute(!mute)} color='primary'>
                        {mute ?  <MicIcon fontSize="large" color='blue'/> : <MicOffIcon fontSize="inherit" color='blue'/>}
                    </IconButton>
                }
            />
        </div>
    )
}