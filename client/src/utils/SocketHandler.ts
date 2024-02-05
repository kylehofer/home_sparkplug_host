import React from 'react';
import { decodePayload, encodePayload, UMetric, UPayload } from './sparkplugbpayload';
import Store, { updateAction, deathAction, birthAction } from '../redux/store';

const RECONNECT_TIME = 5000;

async function getLength(blob: Blob, start: number) {
    const array = new Uint8Array(await blob.slice(start, start + 4).arrayBuffer());

    let length = 0;

    for (let index = array.length - 1; index >= 0; index--) {
        length = (length * 256) + array[index];
    }
    return length;
}
enum UpdateType {
    PUBLISH = 0,
    DEATH,
    BIRTH
}

/**
 * A class for handling a socket connection to a Websocket Server
 * Used to both receive and send data to the Sparkplug Host
 */
export class SockerHandler {
    constructor(address: string) {
        this.address = address;
    }

    address: string;

    connected: boolean = false;

    socket: WebSocket | null = null;

    /**
     * Connect to the host
     */
    connect() {
        console.log('Attempted to connect to ' + this.address);
        try {
            this.socket = new WebSocket(this.address);

            this.socket.onerror = (): void => {
                if (this.connected) {
                    this.socket?.close();

                }
                else {
                    setTimeout(() => {
                        this.connect();
                    }, RECONNECT_TIME);
                }
            };

            this.socket.onmessage = async (event) => {
                const data: Blob = event.data;

                let index = 0;

                while (index < data.size) {
                    const length = await getLength(data, index);
                    index += 4;

                    const id = await data.slice(index, length + index).text();
                    index += length;

                    const type = await getLength(data, index);
                    index += 4;

                    const payloadLength = await getLength(data, index);
                    index += 4;

                    if (type == UpdateType.DEATH) {
                        Store.dispatch(deathAction(id));
                        index += payloadLength;
                        continue;
                    }

                    if (payloadLength > 0) {

                        let decoded;
                        try {
                            const payload = new Uint8Array(await data.slice(index, index + payloadLength).arrayBuffer());
                            index += payloadLength;
                            decoded = decodePayload(payload);
                        } catch (error) {
                            console.log('Error decoding payload for: ' + id);
                            return;
                        }

                        if (type == UpdateType.BIRTH) {
                            Store.dispatch(birthAction({
                                id, payload: decoded
                            }));

                        }
                        else {
                            Store.dispatch(updateAction({
                                id, payload: decoded
                            }));
                        }
                    }
                }
            };

            this.socket.onopen = (): void => {
                this.connected = true;
                if (this.socket != null) {
                    this.socket.onclose = (): void => {
                        this.connected = false;
                        setTimeout(() => {
                            this.connect();
                        }, RECONNECT_TIME);
                    };
                }

                this.sync();
            };
        } catch (error) {
            setTimeout(() => {
                this.connect();
            }, RECONNECT_TIME);
        }
    }

    /**
     * Sends a configure command to the Sparkplug Host
     * @param address The MQTT Broker address
     */
    configure(address: string)
    {
        if (!this.connected) {
            return;
        }
        const encoder = new TextEncoder();

        const addressBuffer = encoder.encode(address);
        const lengthBuffer = new Uint8Array(Uint32Array.of(addressBuffer.length));
        const buffer = new Uint8Array(1 + 4 + addressBuffer.length);

        buffer[0] = 2;

        buffer.set(lengthBuffer, 1);
        buffer.set(addressBuffer, 5);

        this.socket?.send(buffer);
    }

    /**
     * Sends a Sparkplug payload to the Sparkplug Host
     * @param source The Source of the message, including Sparkplug message type
     * @param data The UMetric to add to the payload
     */
    send(source: string, data: UMetric) {
        if (!this.connected) {
            return;
        }

        const topic = 'spBv1.0/' + source;

        const commandPayload: UPayload = {
            'timestamp': new Date().getTime(),
            'metrics': [
                data
            ]
        };

        const encoder = new TextEncoder();

        const rawPayload = encodePayload(commandPayload);
        const topicBuffer = encoder.encode(topic);
        const lengthBuffer = new Uint8Array(Uint32Array.of(topicBuffer.length));
        const buffer = new Uint8Array(1 + 4 + topicBuffer.length + rawPayload.length);

        buffer[0] = 1;

        buffer.set(lengthBuffer, 1);
        buffer.set(topicBuffer, 5);
        buffer.set(rawPayload, 1 + 4 + topicBuffer.length);

        this.socket?.send(buffer);
    }

    /**
     * Requests the Sparkplug Host to resync the Client
     */
    sync()
    {
        if (!this.connected) {
            return;
        }

        const buffer = new Uint8Array(1);
        buffer[0] = 0;

        this.socket?.send(buffer);

    }
}

export default React.createContext<SockerHandler>(new SockerHandler(process.env.SPARKPLUG_HOST_ADDRESS || 'ws://localhost:9000'));

