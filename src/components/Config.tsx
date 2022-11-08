import { useState } from 'react';
import './Config.css';

const initialOptions = [
  'Open a new tab in your browser',
  'Increase the PC sound',
  'Decrease the PC sound',
  'Open Visual Studio Code',
];

type SelectedOptions = {
  symbol: string;
  option: string;
};

const Config = () => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions[]>([]);
  const handleSelectDir = async () => {
    window.electron.ipcRenderer.sendMessage('select-dir');
  };
  const handleSaveUserSettings = () => {
    window.electron.ipcRenderer.sendMessage(
      'set-user-settings',
      selectedOptions
    );
  };
  return (
    <div>
      <div className="optionsContainer">
        <div className="option">
          <h3>Symbol 1 - Direction: Up</h3>
          <select
            placeholder="Select an option"
            onChange={(e) =>
              setSelectedOptions([
                ...selectedOptions,
                { symbol: '1 Up', option: e.target.value },
              ])
            }
            className="selectContainer"
          >
            <option disabled selected value="">
              {' '}
              -- Select an option --{' '}
            </option>

            {initialOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="option">
          <h3>Symbol 1 - Direction: Down</h3>
          <select
            className="selectContainer"
            onChange={(e) =>
              setSelectedOptions([
                ...selectedOptions,
                { symbol: '1 Down', option: e.target.value },
              ])
            }
          >
            <option disabled selected value="">
              {' '}
              -- Select an option --{' '}
            </option>
            {initialOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="option">
          <h3>Symbol 1 - Direction: Left</h3>
          <select
            className="selectContainer"
            onChange={(e) =>
              setSelectedOptions([
                ...selectedOptions,
                { symbol: '1 Left', option: e.target.value },
              ])
            }
          >
            <option disabled selected value="">
              {' '}
              -- Select an option --{' '}
            </option>
            {initialOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="option">
          <h3>Symbol 1 - Direction: RIght</h3>
          <select
            className="selectContainer"
            onChange={(e) =>
              setSelectedOptions([
                ...selectedOptions,
                { symbol: '1 Right', option: e.target.value },
              ])
            }
          >
            <option disabled selected value="">
              {' '}
              -- Select an option --{' '}
            </option>
            {initialOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button className="nonStyle" type="button" onClick={handleSelectDir}>
        <p className="clickMe">
          Click here to define which folder you want to VSCode open
        </p>
      </button>
      <button
        className="submitBtn"
        type="button"
        onClick={handleSaveUserSettings}
      >
        <p>Save changes</p>
      </button>
    </div>
  );
};

export default Config;
