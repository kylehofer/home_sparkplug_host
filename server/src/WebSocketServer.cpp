/*
 * File: WebSocketServer.cpp
 * Project: home_sparkplug_host
 * Created Date: Friday February 2nd 2024
 * Author: Kyle Hofer
 *
 * MIT License
 *
 * Copyright (c) 2024 Kyle Hofer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * HISTORY:
 */

#include "WebSocketServer.h"

using websocketpp::lib::bind;
using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;

using websocketpp::lib::condition_variable;
using websocketpp::lib::lock_guard;
using websocketpp::lib::mutex;
using websocketpp::lib::thread;
using websocketpp::lib::unique_lock;

typedef websocketpp::server<websocketpp::config::asio> AsioServer;

WebSocketServer::WebSocketServer()
{
    server.set_access_channels(websocketpp::log::alevel::none);
    server.set_reuse_addr(true);

    // Initialize Asio Transport
    server.init_asio();

    // Register handler callbacks
    server.set_open_handler(bind(&WebSocketServer::onConnectionOpen, this, ::_1));
    server.set_close_handler(bind(&WebSocketServer::onConnectionClose, this, ::_1));
    server.set_message_handler(bind(&WebSocketServer::onMessage, this, ::_1, ::_2));
}

void WebSocketServer::run()
{
    // listen on specified port
    server.listen(9000);

    // Start the server accept loop
    server.start_accept();

    // Start the ASIO io_service run loop
    try
    {

        server.run();
    }
    catch (const websocketpp::exception &exception)
    {
        std::cout << exception.what() << std::endl;
    }
    catch (const std::exception &e)
    {
        std::cout << e.what() << std::endl;
    }
}

void WebSocketServer::stop()
{
    std::string shutdownReason("Shutting down");

    server.stop_listening();

    {
        lock_guard guard(connectionLock);

        for (auto connectionIterator = connections.begin(); connectionIterator != connections.end(); ++connectionIterator)
        {
            server.close(*connectionIterator, websocketpp::close::status::going_away, shutdownReason);
        }
    }

    server.stop();
}

void WebSocketServer::send(const std::string &message, const Connection &connection)
{
    try
    {
        server.send(connection, message, websocketpp::frame::opcode::BINARY);
    }
    catch (const websocketpp::exception &exception)
    {
        std::cout << exception.what() << std::endl;
    }
    catch (const std::exception &exception)
    {
        std::cout << exception.what() << std::endl;
    }
}

void WebSocketServer::send(const std::string &message)
{
    lock_guard guard(connectionLock);
    for (auto &connection : connections)
    {
        this->send(message, connection);
    }
}

Action WebSocketServer::getAction()
{
    if (actionQueue.empty())
    {
        return NOTHING_ACTION;
    }

    {
        lock_guard guard(actionLock);
        auto action = actionQueue.front();
        actionQueue.pop();
        return action;
    }
}

void WebSocketServer::onConnectionOpen(Connection connection)
{
    {
        lock_guard guard(connectionLock);
        connections.insert(connection);
    }
    {
        lock_guard guard(actionLock);
        actionQueue.push(Action(ActionType::RESYNC, connection));
    }
}

void WebSocketServer::onConnectionClose(Connection connection)
{

    lock_guard guard(connectionLock);
    connections.erase(connection);
}

void WebSocketServer::onMessage(Connection connection, AsioServer::message_ptr message)
{
    auto payload = message->get_raw_payload();
    auto data = payload.c_str();
    auto length = payload.size();

    uint8_t type = data[0];

    switch (type)
    {
    case ActionType::RESYNC:
    {
        lock_guard guard(actionLock);
        actionQueue.push(Action(ActionType::RESYNC, connection));
    }
    break;
    case ActionType::COMMAND:
    {
        void *command = malloc(length - 1);
        memcpy(command, &data[1], length - 1);
        actionQueue.push(Action(ActionType::COMMAND, connection, command, length - 1));
    }
    break;

    case ActionType::CONFIGURE:
    {
        void *configuration = malloc(length - 1);
        memcpy(configuration, &data[1], length - 1);
        actionQueue.push(Action(ActionType::CONFIGURE, connection, configuration, length - 1));
    }
    break;

    default:
        break;
    }
}
