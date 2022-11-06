import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Guide from 'components/Guide';
import Settings from './Settings';

const Hello = () => {
  const handleStartProgram = () => {
    window.electron.ipcRenderer.sendMessage('start-program');
  };

  return (
    <div className="container">
      <h1>React HMR (Hand Move Recognition) </h1>
      <h3>Initial Guide</h3>
      <Guide />
      <div>
        <p>
          After configuring your commands, you can click in the Start button,{' '}
          the app will start to run in background and you can start using your
          commands.
        </p>
      </div>
      <button onClick={handleStartProgram} className="startBtn" type="submit">
        <p>Start</p>
      </button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
