import React, { useState } from 'react';
import './Disclaimer.css';

interface DisclaimerProps {
  onAccept: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (agreed) {
      localStorage.setItem('of_disclaimer_accepted', 'true');
      onAccept();
    }
  };

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-box">
        <h2>⚠️ Liability Disclaimer</h2>
        <div className="disclaimer-text">
          <p>
            <strong>OpenForge</strong> uses advanced Artificial Intelligence to process commands and control this computer.
          </p>
          <p>
            By using this software, you acknowledge and agree that:
          </p>
          <ul>
            <li>The AI can execute system commands, modify files, and access data.</li>
            <li>You are solely responsible for reviewing AI actions.</li>
            <li>The developers of OpenForge are not liable for any data loss, system damage, or unintended consequences resulting from the use of this software.</li>
            <li>This software is provided "as is", without warranty of any kind.</li>
          </ul>
          <p>
             Use at your own risk. It is recommended to run this in a controlled environment.
          </p>
        </div>
        <div className="disclaimer-actions">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
            />
            I have read and agree to the terms above.
          </label>
          <button 
            className={`accept-btn ${!agreed ? 'disabled' : ''}`} 
            onClick={handleConfirm}
            disabled={!agreed}
          >
            Launch System
          </button>
        </div>
      </div>
    </div>
  );
};
