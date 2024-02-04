/*
 * File: WebSocketServer.h
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

#ifndef WEBSOCKETSERVER
#define WEBSOCKETSERVER

#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>
#include <websocketpp/common/thread.hpp>
#include <set>
#include <queue>
#include <mutex>
#include "utils/enum.h"

typedef websocketpp::connection_hdl Connection;

BETTER_ENUM(ActionType, uint8_t,
            RESYNC = 0,
            COMMAND,
            CONFIGURE,
            DO_NOTHING)

/**
 * @brief Handles data required for actions
 *
 */
struct Action
{
    Action(ActionType type) : type(type), data(nullptr) {}
    Action(ActionType type, Connection handle) : type(type), connection(handle) {}
    Action(ActionType type, Connection handle, void *data, size_t length) : type(type), connection(handle), data(data), length(length) {}

    ActionType type = ActionType::DO_NOTHING;
    Connection connection;
    void *data = nullptr;
    size_t length = 0;

    /**
     * @brief Free data used by the action
     *
     */
    void clear()
    {
        if (data)
        {
            free(data);
            data = nullptr;
        }
    }
};

static Action NOTHING_ACTION(ActionType::DO_NOTHING);

/**
 * @brief Handles the functionality for a websocket asio server
 *
 */
class WebSocketServer
{
private:
    websocketpp::server<websocketpp::config::asio> server;
    std::set<Connection, std::owner_less<Connection>> connections;
    std::queue<Action> actionQueue;

    std::mutex actionLock;
    std::mutex connectionLock;

    websocketpp::lib::condition_variable actionCondition;

    /**
     * @brief Callback for when a websocket connection is opened.
     *
     * @param connection
     */
    void onConnectionOpen(Connection connection);
    /**
     * @brief Callback for when a websocket connection is closed.
     *
     * @param connection
     */
    void onConnectionClose(Connection connection);
    /**
     * @brief Callback for when a message is received by a connection.
     *
     * @param connection
     * @param message
     */
    void onMessage(Connection connection, websocketpp::server<websocketpp::config::asio>::message_ptr message);

protected:
public:
    WebSocketServer();

    /**
     * @brief Starts the websocket server
     *
     */
    void run();
    /**
     * @brief Stops the websocket server
     *
     */
    void stop();

    /**
     * @brief Sends a message to a websocket connection
     *
     * @param message
     * @param connection
     */
    void send(const std::string &message, const Connection &connection);
    /**
     * @brief Sends a message to all open websocket connections
     *
     * @param message
     */
    void send(const std::string &message);

    /**
     * @brief Gets any queued actions
     *
     * @return Action
     */
    Action getAction();
};

#endif /* WEBSOCKETSERVER */
