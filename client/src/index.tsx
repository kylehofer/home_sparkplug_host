import React from 'react';
import ReactDOM from 'react-dom/client';
import SocketContext, {SockerHandler} from './utils/SocketHandler';
import DebugView from './views/DebugVIew';
import ConfigView from './views/ConfigView';

export const socketHandler = new SockerHandler(`ws://${process.env.SPARKPLUG_HOST || location.hostname}:${process.env.WEBSOCKET_PORT || 9000}`);
socketHandler.connect();

import {
    createBrowserRouter, RouterProvider
} from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        element: <DebugView/>,
    },
    {
        path: 'config',
        element: <ConfigView/>,
    },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <SocketContext.Provider value={socketHandler}>
        <RouterProvider router={router} />
    </SocketContext.Provider>
);