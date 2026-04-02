import { useState } from 'react';
import './Sidebar.css';

const COLUMN_OPTIONS = ['Outstanding', 'Current', 'Delinquent', 'Prepaid', 'Defaulted'];

export default function Sidebar({ onRun, columns, onColumnsChange, hideNonOutstanding, onToggleHide }) {
  const [cusipInput, setCusipInput] = useState('');
  const [selectedCusips, setSelectedCusips] = useState([]);

  const handleRun = () => {
    const cusips = cusipInput
      .split(';')
      .map((c) => c.trim())
      .filter(Boolean);
    setSelectedCusips(cusips);
    onRun(cusips);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRun();
  };

  const handleCheckbox = (col) => {
    if (hideNonOutstanding && col !== 'Outstanding') return;
    const next = columns.includes(col)
      ? columns.filter((c) => c !== col)
      : [...columns, col];
    onColumnsChange(next);
  };

  return (
    <div className="sidebar">
      <label className="sidebar-label">Please provide a list of cusips</label>
      <input
        type="text"
        className="sidebar-input"
        value={cusipInput}
        onChange={(e) => setCusipInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. 17313EAU9;00252FAM3"
      />
      {selectedCusips.length > 0 && (
        <div className="sidebar-selected">
          Selected: {selectedCusips.join(';')}
        </div>
      )}
      <button className="sidebar-run" onClick={handleRun}>
        Run
      </button>

      <div className="sidebar-toggle">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={hideNonOutstanding}
            onChange={onToggleHide}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="toggle-label">Hide All except Outstanding</span>
      </div>

      <div className="sidebar-checkboxes">
        {COLUMN_OPTIONS.map((col) => (
          <label
            key={col}
            className={`checkbox-label ${hideNonOutstanding && col !== 'Outstanding' ? 'disabled' : ''}`}
          >
            <input
              type="checkbox"
              checked={columns.includes(col)}
              onChange={() => handleCheckbox(col)}
              disabled={hideNonOutstanding && col !== 'Outstanding'}
            />
            {col}
          </label>
        ))}
      </div>
    </div>
  );
}
