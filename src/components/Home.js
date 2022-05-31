import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext} from './Context';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
    const { name:userName, setName: setUserName } = useContext(UserContext);
    const navigate = useNavigate();
    const handleCreateRoom = () => {
        navigate('room/' + name + '_' + generateRandomString(16));
    }
    const handleEnterRoom = () => {
        navigate('room/' + room);
    }
    const theme = createTheme();
    return (
        <ThemeProvider theme={theme}>
          <Grid container component="main" sx={{ height: '100vh' }}>
            <CssBaseline />
            <Grid
              item
              xs={false}
              sm={4}
              md={7}
              sx={{
                backgroundImage: 'url(https://source.unsplash.com/random)',
                backgroundRepeat: 'no-repeat',
                backgroundColor: (t) =>
                  t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
              <Box
                sx={{
                  my: 8,
                  mx: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography component="h3" variant="h5">
                  Start a new meeting...
                </Typography>
                <Box component="form" sx={{ mt: 1 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    onChange={(e) => setUserName(e.target.value)}
                    id="User name"
                    label="User name"
                    name="User name"
                    autoComplete="User name"
                    autoFocus
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    onChange={(e) => setName(e.target.value)}
                    name="Room name"
                    label="Room name"
                    type="Room name"
                    id="Room name"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={handleCreateRoom}
                    disabled={userName.length === 0 || name.length === 0}
                  >
                    Create a room
                  </Button>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    onChange={(e) => setUserName(e.target.value)}
                    id="User name"
                    label="User name"
                    name="User name"
                    autoComplete="User name"
                    autoFocus
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    onChange={(e) => setRoom(e.target.value)}
                    name="Room id"
                    label="Room id"
                    type="Room id"
                    id="Room id"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    onClick={handleEnterRoom}
                    disabled={userName.length === 0 ||room.length === 0}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Enter a room
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </ThemeProvider>
    );
}