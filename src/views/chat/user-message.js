import React from 'react';
import moment from 'moment';

const UserMessage = ({ text, time }) => {
  return (
    <div className='user-sms-wrapper'>
      <div className='user-message'>
        {text}
        <div className='time'>{moment(new Date(time)).format('HH:mm')}</div>
      </div>
    </div>
  );
};

export default UserMessage;
