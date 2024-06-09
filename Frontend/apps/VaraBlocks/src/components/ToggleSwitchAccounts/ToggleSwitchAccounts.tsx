import { useContext } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { polkadotAccountIsEnable } from '@/app/SliceReducers';
import PolkadotImage from '@/assets/images/icons/polkadot_js_logo.png';
import LockImage from '@/assets/images/icons/lock.png';
import { useAccount, useAlert } from '@gear-js/react-hooks';
import { signlessDataContext } from '@/app/Context';

import './ToggleSwitchAccounts.scss';

export const ToggleSwitchAccounts = () => {
  const account = useAccount();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const { setSignlessData } = useContext(signlessDataContext);
  const polkadotAccountSelected = useAppSelector((state) => state.AccountsSettings.polkadotEnable);
  
  return (
    <label className={`toggle-switch${polkadotAccountSelected ? ' toggle-switch--polkadot-color' : ''}`}>
        <input 
          type="checkbox"
          onChange={(e) => {
            const checked = e.target.checked;
            if (!account.account) {
              alert.error('No wallet detected!');
            } 

            if (checked && account.account) {
              dispatch(polkadotAccountIsEnable(true));
            } else {
              dispatch(polkadotAccountIsEnable(false));
            }
            
            if (setSignlessData) setSignlessData(null);
          }}
          checked={polkadotAccountSelected}
        />
        <div className='toggle-switch__slider-image'>
          <img 
            src={polkadotAccountSelected ? PolkadotImage : LockImage} 
            alt="Singless Account Type" 
            className={ polkadotAccountSelected ? 'polkadot-selected' : '' }
          />
        </div>
    </label>
  )
}
