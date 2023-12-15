import React from 'react';
import { Switch } from 'antd';
import '../assets/scss/components/switch.scss';

const Toggle = ({ checked, onChange }) => {
  return (
    <Switch
      className='toggle me-3'
      // checkedChildren={"on"}
      // unCheckedChildren={"off"}
      checked={checked}
      size='small'
      onChange={onChange}
    />
  );
};

export default Toggle;
