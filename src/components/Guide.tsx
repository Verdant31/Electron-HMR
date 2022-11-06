import '../renderer/App.css';
import { useNavigate } from 'react-router-dom';
import firstSymbol from '../../assets/hands/26b2f662-3c33-4dc6-95a4-809622c59c5e-removebg-preview.png';
import secondSymbol from '../../assets/hands/be9bb54f-ee56-4e75-bf53-2cd8d7f65061-removebg-preview.png';

const Guide = () => {
  const navigate = useNavigate();
  const handleRedirectToSettings = () => {
    navigate('settings');
  };
  const handleOpenUserCamera = () => {
    window.electron.ipcRenderer.sendMessage('open-camera');
  };
  return (
    <>
      <div>
        <p className="description">
          This program allow you to do actions in your Desktop using
          <span> hand gestures</span>.
        </p>
        <p>
          We have a pre-set number of actions that you can do using your hand.
          By now we have <span className="bold">two symbols</span> that you can
          use to trigger this actions.
        </p>
        <p>
          Each symbol has a different action based on the direction of the
          gesture (Top, Left, Right or Bottom) — i.e., you have
          <span className="bold"> 8 different actions.</span>
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}
        >
          <img src={firstSymbol} alt="Hand symbol 1" />
          <img src={secondSymbol} alt="Hand symbol 1" />
        </div>
        {/*         <ul className="list">
          <li>Open a new tab in your browser</li>
          <li>Increase/Decrease the PC sound</li>
          <li>Open Visual Studio Code</li>
          <li>Open a game</li>
        </ul> */}
      </div>
      <div>
        <p>
          Preferably, you will always will want to start the movement with your
          hand in the <span className="bold">center</span> of your webcam.
        </p>
        <p>
          To help you doing that, you can{' '}
          <button
            onClick={handleOpenUserCamera}
            className="nonStyle"
            type="button"
          >
            <p>click here</p>
          </button>{' '}
          to open a new window with your cam.
        </p>
      </div>
      <p className="settingsLink">
        To configure your commands,{' '}
        <button
          onClick={handleRedirectToSettings}
          className="nonStyle"
          type="button"
        >
          {' '}
          <p>click here.</p>
        </button>
      </p>
    </>
  );
};

export default Guide;
