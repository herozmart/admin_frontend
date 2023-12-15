import React from 'react';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

export default function DeleteButton({ onClick, type = 'default', ...props }) {
  const handleClick = () => {
    onClick();
  };

  return (
    <Button
      icon={<DeleteOutlined />}
      onClick={handleClick}
      type={type}
      {...props}
    />
  );
}
