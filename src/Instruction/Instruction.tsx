import { flyToKaaba } from '../Map';

import './style.css';

function Instruction() {
  return (
    <div className="qibla__instruction-container">
      <div className="qibla__instruction-group">
        <div className="qibla__instruction">
          Click on the map to find the Qibla
        </div>
        <button
          type="button"
          className="qibla__kaaba-button"
          title="Go to the Kaaba"
          aria-label="Go to the Kaaba"
          onClick={ flyToKaaba }
        >
          <img src="/kaaba.svg" alt="" />
        </button>
      </div>
    </div>
  );
}

export default Instruction;
