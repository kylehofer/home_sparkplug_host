/*
 * File: server.cpp
 * Project: home_sparkplug_host
 * Created Date: Thursday January 18th 2024
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

#include "SparkplugHost.h"
#include "WebSocketServer.h"
#include <thread>
#include <chrono>
#include "types/TahuTypes.h"
#include <functional>
#include <set>
#include <tuple>

using std::chrono::duration_cast;
using std::chrono::milliseconds;
using std::chrono::seconds;
using std::chrono::steady_clock;

#define MAX_BUFFER_LENGTH 1048576
#define SPARKPLUG_UPDATE_PERIOD 1 // In seconds
#define EXECUTION_TIMEOUT 20ms

/**
 * @brief Appends a Sparkplug payload to a raw buffer
 *
 * @param message
 * @param data
 */
void appendPayload(std::string &message, PublishableUpdate &data)
{
    size_t position = 0;
    size_t idSize = data.id.length();
    static uint8_t buffer[MAX_BUFFER_LENGTH];

    size_t dataLength = sizeof(uint32_t) + sizeof(uint32_t) + idSize + sizeof(UpdateType);

    memcpy(buffer, &idSize, sizeof(uint32_t));
    position += sizeof(uint32_t);

    memcpy(&buffer[position], data.id.c_str(), idSize);
    position += idSize;

    memcpy(&buffer[position], &data.type, sizeof(UpdateType));
    position += sizeof(UpdateType);

    size_t payloadSize = 0;
    if (data.payload != nullptr)
    {

        payloadSize = encode_payload(&buffer[position + sizeof(uint32_t)], MAX_BUFFER_LENGTH, data.payload);
        dataLength += payloadSize;
    }

    memcpy(&buffer[position], &payloadSize, sizeof(uint32_t));
    position += sizeof(uint32_t);

    message.append((char *)buffer, dataLength);
}

// Exit signal handling
std::function<void(int)> shutdown_handler;
void signal_handler(int signal) { shutdown_handler(signal); }

int main(int argc, char *argv[])
{
    string SERVER_ADDRESS;
    string CLIENT_ID;
    string HOST_ID;

    {
        if (argc > 1)
        {
            SERVER_ADDRESS = {argv[1]};
        }
        else
        {
            SERVER_ADDRESS = {"tcp://localhost:1883"};
        }

        if (argc > 2)
        {
            HOST_ID = {argv[2]};
        }

        if (argc > 3)
        {
            CLIENT_ID = {argv[3]};
        }
        else
        {
            char clientId[256];
            std::srand(std::time(nullptr));
            int random = std::rand();
            sprintf(clientId, "sparkplug_host_%d", random);
            CLIENT_ID = {clientId};
        }
    }

    printf("Starting Sparkplug host connecting to: %s with a client_id %s", SERVER_ADDRESS.c_str(), CLIENT_ID.c_str());
    if (HOST_ID.empty())
    {
        printf(".\n");
    }
    else
    {
        printf(" and with a Primary Host ID of: %s.\n", HOST_ID.c_str());
    }

    SparkplugHost host(SERVER_ADDRESS, CLIENT_ID, HOST_ID);

    WebSocketServer server;

    std::thread hostThread(&SparkplugHost::run, &host);
    std::thread serverThread(&WebSocketServer::run, &server);

    std::atomic<bool> running = true;

    // Stop our servers to allow a shutdown
    shutdown_handler = [&server, &host, &running](int signum)
    {
        running = false;
        host.stop();
        server.stop();
    };

    std::signal(SIGINT, signal_handler);

    steady_clock::time_point begin = steady_clock::now();

    // Control loop that'll pass messages between the sparkplug server and the websocket server
    while (running)
    {
        // Get any queued actions from the websocket server
        auto action = server.getAction();

        switch (action.type)
        {
        // A websocket connection has requested a resync
        case ActionType::RESYNC:
        {
            auto payloads = host.getPayloads(true);
            std::string message;

            for (auto &payload : payloads)
            {
                appendPayload(message, payload);
                if (payload.payload)
                {
                    free_payload(payload.payload);
                    free(payload.payload);
                }
            }

            server.send(message, action.connection);
        }
        break;
        // A websocket connection has send a command (NCMD/DCMD)
        case ActionType::COMMAND:
        {
            char *data = (char *)action.data;
            uint32_t topicLength = 0;
            memcpy(&topicLength, data, 4);

            std::string topic = std::string(&data[4], topicLength);

            tahu::Payload *sparkplugPayload = (tahu::Payload *)malloc(sizeof(tahu::Payload));
            *sparkplugPayload = org_eclipse_tahu_protobuf_Payload_init_zero;
            if (decode_payload(sparkplugPayload, (uint8_t *)&data[4 + topicLength], action.length - 4 - topicLength) >= 0)
            {
                host.command(SparkplugMessage(topic, sparkplugPayload));
            }
            else
            {
                free_payload(sparkplugPayload);
                free(sparkplugPayload);
            }

            action.clear();
        }
        break;
        // A websocket connection is requesting the Sparkplug Host to be reconfigured
        case ActionType::CONFIGURE:
        {
            char *data = (char *)action.data;
            uint32_t addressLength = 0;
            memcpy(&addressLength, data, 4);

            string address(&data[4], action.length - 4);

            host.configure(address);

            action.clear();
        }

        break;
        default:
            break;
        }

        // We'll send updates periodically
        if (duration_cast<seconds>(steady_clock::now() - begin).count() > SPARKPLUG_UPDATE_PERIOD)
        {
            begin = steady_clock::now();
            auto payloads = host.getPayloads(false);
            std::string message;

            for (auto &payload : payloads)
            {
                appendPayload(message, payload);
                if (payload.payload)
                {
                    free_payload(payload.payload);
                    free(payload.payload);
                }
            }

            server.send(message);
        }

        std::this_thread::sleep_for(EXECUTION_TIMEOUT);
    }

    // When we exit we'll wait for our threads to finish
    hostThread.join();
    serverThread.join();

    return 0;
}