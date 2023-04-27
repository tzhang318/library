import { useState, useEffect } from 'react';

import '../App.css';

export const Home = props => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const changePie = () => {
      if (percent > 100) {
        setPercent(0);
      } else {
        setPercent(percent + 1);
      }
    };
    const interval = setInterval(changePie, 200);
    return () => {
      clearInterval(interval);
    }
  }, [percent]);

  return (
    <div style={{ marginTop: '5rem', fontWeight: 'bold', textAlign: 'center' }} >
      Welcome to our library
      <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ marginRight: '2rem' }}>
        <h3>Pie</h3>
        <div className="pie" style={{ "--percentage":`${percent}%`}}>
        </div>
      </div>
      <div>
        <h3>Ring</h3>
        <div className="pie" style={{ "--percentage":`${percent}%`}}>
          <div className='center'></div>
        </div>
      </div>
      </div>
    </div>
  );
};
