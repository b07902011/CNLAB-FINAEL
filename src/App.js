import './App.css';
import { ChatRoom } from './components/ChatRoom'
import {
    Routes,
    Route,
} from "react-router-dom";
import { Home } from './components/Home';

function App() {
  return (
    <div className="App">
        <header className="App-header">
            <Routes>
                <Route path="/" element={<Home/> }/>
                <Route path="/room/:room" element={<ChatRoom/>}/>
            </Routes>
        </header>
    </div>
  );
}

export default App;
