import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { BsCheck2All } from 'react-icons/bs';
import moment from 'moment';

const AdminMessage = ({ text, time, status = 'ok' }) => {
  return (
    <div className='admin-message-wrapper'>
      <div className='admin-message'>
        {text}
        <div className='time'>{moment(new Date(time)).format('HH:mm')}</div>
        <span className='double-check'>
          {status === 'pending' ? (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 12 }} />} />
          ) : (
            <BsCheck2All />
          )}
        </span>
      </div>
    </div>
  );
};

export default AdminMessage;
