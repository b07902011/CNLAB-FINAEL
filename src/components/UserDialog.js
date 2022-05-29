import React, { useContext, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { UserContext } from "./Context";

export const UserDialog = ({ open }) => {
    const { setName } = useContext(UserContext);
    const [user, setUser] = useState('');

    return (
        <Dialog open={open}  aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">User Name</DialogTitle>
            <DialogContent>
            <DialogContentText>
                To join this chatroom, you should set your user name.
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="user name"
                fullWidth
                onChange={(e)=>setUser(e.target.value)}
            />
            </DialogContent>
            <DialogActions>
            <Button onClick={()=>setName(user)} color="primary">
                Enter
            </Button>
            </DialogActions>
        </Dialog>
    )
}