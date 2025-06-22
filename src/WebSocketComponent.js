import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { API_BASE_URL } from 'constants';

const WebSocketComponent = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const socket = new SockJS(API_BASE_URL + '/ws'); // WebSocket endpoint
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, (frame) => {
      console.log('Connected: ' + frame);

      // Đăng ký subscribe để nhận tin nhắn từ server
      stompClient.subscribe('/topic/messages', (msg) => {
        setMessage(msg.body); // Nhận và hiển thị tin nhắn từ server
      });
    });

    // Cleanup khi component bị unmount
    return () => {
      stompClient.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const socket = new SockJS(API_BASE_URL + '/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, (frame) => {
      console.log('Connected: ' + frame);

      // Gửi tin nhắn đến server
      stompClient.send('/app/send', {}, JSON.stringify({ message: 'Hello from React!' }));
    });
  };

  return (
    <div>
      <button onClick={sendMessage}>Send Message</button>
      <div>{message}</div>
    </div>
  );
};

export default WebSocketComponent;
