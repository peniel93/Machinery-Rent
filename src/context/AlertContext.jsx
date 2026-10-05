import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // type: 'success' | 'danger' | 'warning' | 'info'
  const showAlert = (message, type = 'info', timeoutMs = 5000) => {
    const id = Date.now() + Math.random();
    const newAlert = { id, message, type };
    setAlerts(prev => [...prev, newAlert]);

    if (timeoutMs > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, timeoutMs);
    }
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
