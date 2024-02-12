import React from 'react';
import ReactDOM from 'react-dom/client';
import SocketContext, {SockerHandler} from './utils/SocketHandler';
import './index.css';

const socketHandler = new SockerHandler(`ws://${process.env.SPARKPLUG_HOST || location.hostname}:${process.env.WEBSOCKET_PORT || 9000}`);

socketHandler.connect();

import Application from './views/Application';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <SocketContext.Provider value={socketHandler}>
        <Application/>
    </SocketContext.Provider>
);