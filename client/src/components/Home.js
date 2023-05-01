import { useState, useEffect } from 'react';
import barcelona from '../assets/barcelona.svg';
import rm from '../assets/real-madrid.svg';
import atm from '../assets/athletic-madrid.svg';
import sevilla from '../assets/sevilla.svg';
import bilbao from '../assets/bilbao.svg';
import sociadad from '../assets/real-sociedad.svg';
import betis from '../assets/real-betis.svg';
import valencia from '../assets/valencia.svg';
import espanyol from '../assets/espanyol.svg';
import villarreal from '../assets/villarreal.svg';

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
    <div style={{ marginTop: '2rem', fontWeight: 'bold', textAlign: 'center' }} >
      <h3>Welcome to our library</h3>
      <div className='logo-slider'>
        <div className='logos'>
          <div>
            <img src={barcelona} className='logo' alt='bfc' />
          </div>
          <div>
            <img src={rm} className='logo' alt='bfc' />
          </div>
          <div>
            <img src={atm} className='logo' alt='bfc' />
          </div>
          <div>
            <img src={sevilla} className='logo' alt='bfc' />
          </div>
          <div>
            <img src={bilbao} className='logo' alt='bfc' />
          </div>
          <div>
            <img src={valencia} className='logo' alt='bfc' />
          </div>
          <div>
            <img src={sociadad} className='logo' alt='bfc' />
          </div>
          <div>
            <img src={betis} className='logo' alt='bfc' />
          </div>
          <div>
            <img src={espanyol} className='logo' alt='bfc' />
          </div>
          <div>
            <img src={villarreal} className='logo' alt='bfc' />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ marginRight: '2rem' }}>
          <h3>Pie</h3>
          <div className="pie" style={{ "--percentage":`${percent}%`}} />
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
