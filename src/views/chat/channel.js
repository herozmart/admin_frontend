import React from 'react';
import ChatDate from './chat-date';
import AdminMessage from './admin-message';
import UserMessage from './user-message';
import '../../assets/scss/page/chat.scss';

export default function Channel({ groupMessages, messageEndRef }) {
  return (
    <div className='chat-box'>
      {groupMessages.map((item, idx) => (
        <div key={'chat' + idx}>
          {item.date !== 'Invalid date' ? <ChatDate date={item.date} /> : ''}
          <div className='sms-box'>
            {item.messages.map((item) =>
              Boolean(item.sender) ? (
                <UserMessage
                  key={item.id}
                  text={item.chat_content}
                  time={item.created_at}
                />
              ) : (
                <AdminMessage
                  key={item.id}
                  text={item.chat_content}
                  time={item.created_at}
                  status={item.status}
                />
              )
            )}
          </div>
        </div>
      ))}
      <div ref={messageEndRef} />
    </div>
  );
}
