import React, { createContext, useContext, useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { useAuth } from './AuthContext';

const MQTTContext = createContext<any>(null);

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    const client = mqtt.connect('ws://localhost:9001');

    client.on('connect', () => {
      console.log('Conectado ao Mosquitto via WebSocket');
      client.subscribe(`notifications/${user.id}`);
    });

    client.on('message', (topic, message) => {
      const payload = JSON.parse(message.toString());
      setLastMessage(payload);
    });

    return () => {
      if (client) client.end();
    };
  }, [user?.id]);

  return (
    <MQTTContext.Provider value={{ lastMessage }}>
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTT = () => useContext(MQTTContext);