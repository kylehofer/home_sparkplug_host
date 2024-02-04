import { Unsubscribe, configureStore, createAction, createReducer } from '@reduxjs/toolkit';
import '../utils/sparkplugPayloadProto';
import { UMetric, UPayload, UPropertySet } from '../utils/sparkplugbpayload';

export enum PublisherState {
    Alive,
    Dead,
}

export interface Subfolder {
    name: string,
    children: Metrics
}

export declare type Metrics = Array<UMetric | Subfolder>;

export interface Device {
    state: PublisherState,
    metrics: Record<string, UMetric>
}

export interface Node extends Device {
    devices: Record<string, Device>;
}

export declare type Group = Record<string, Node>;

export interface Message {
    id: string;
    payload: UPayload;
}

export const updateAction = createAction<Message>('update');
export const birthAction = createAction<Message>('birth');
export const deathAction = createAction<string>('death');

export function isUMetric(object: Metrics | UMetric): object is UMetric {
    return object && 'value' in object;
}

/**
 * Updates a property set on the store
 * @param state 
 * @param propertySet 
 * @returns {UPropertySet} The updated property set
 */
function updatePropertySet(state: UPropertySet | undefined = {}, propertySet: UPropertySet) : UPropertySet {
    Object.keys(propertySet).forEach((key) => {
        const value = propertySet[key];
        if (value.value) {
            if (value.type == 'PropertySet') {
                // @ts-expect-error The data in our store is from a Sparkplug Protobuf. The `type` property defines the data stored in this type, and we can ignore TS type checking here.
                state[key] = updatePropertySet(state[key].value, value.value);
            } else {
                state[key] = {
                    
                    ...state[key],
                    ...value
                };
            }
        }
    });

    return {
        ...state
    };
}

/**
 * Updates a metric on the store
 * @param state The set of metrics on a Node/Device
 * @param input The Metric to update on the Node/Device
 * @returns {Record<string,UMetric>}
 */
function updateMetric(state: Record<string,UMetric>, input: UMetric): Record<string,UMetric> {
    const {name} = input;
    if (!name)
    {
        return state;
    }

    if (state[name]) {
        return {
            ...state,
            [name] : {
                ...state[name],
                ...input,
                properties: input.properties ? updatePropertySet(state[name].properties, input.properties) : state[name].properties
               
            }
        };
    }

    return {
        ...state,
        [name] : {
            ...input,
        }
    };
}

/**
 * Updates a Device/Node metrics
 * @param state 
 * @param metrics 
 * @returns {Record<string, UMetric>}
 */
function updateMetrics(state: Record<string,UMetric>, metrics: UMetric[] | null | undefined) : Record<string, UMetric> {
    if (!metrics) {
        return state;
    }
    return metrics.reduce((accumulator, metric) => {
        return updateMetric(accumulator, metric);
    }, state);
}

/**
 * Updates a device on the store from a Sparkplug Payload
 * @param state 
 * @param name 
 * @param payload 
 * @returns {Record<string, Device>}
 */
function updateDevice(state: Record<string, Device>, name: string, payload: UPayload): Record<string, Device> {
    return {
        ...state,
        [name]:
        {
            state: state[name] ? state[name].state : PublisherState.Dead,
            metrics: updateMetrics(state[name] ? state[name].metrics : {}, payload.metrics)
        }
    };
}

/**
 * Updates a node/device on the store from a Sparkplug Payload
 * @param state 
 * @param name 
 * @param payload 
 * @param {string} [device] If present, the payload is for a device
 * @returns {Record<string, Node>}
 */
function updateNode(state: Record<string, Node>, name: string, payload: UPayload, device?: string): Record<string, Node> {
    if (device) {
        return {
            ...state,
            [name]: {
                state: state[name] ? state[name].state : PublisherState.Dead,
                devices: updateDevice(state[name] ? state[name].devices : {}, device, payload),
                metrics: state[name] ? state[name].metrics : {},
            }
        };
    }

    return {
        ...state,
        [name]:
        {
            ...(state[name] || { state: PublisherState.Dead, devices: {} }),
            metrics: updateMetrics(state[name] ? state[name].metrics : {}, payload.metrics)
        }
    };
}

/**
 * Action for a Node Birth
 * All data will be overridden by the payload
 * @param state 
 * @param name 
 * @param payload 
 * @returns {Record<string, Node>}
 */
function birthNode(state: Record<string, Node>, name: string, payload: UPayload): Record<string, Node> {
    return {
        ...state,
        [name]:
        {
            state: PublisherState.Alive,
            metrics: updateMetrics({}, payload.metrics),
            devices: {}
        }
    };
}

/**
 * Action for a Device Birth
 * All data will be overridden by the payload
 * @param state 
 * @param name 
 * @param payload 
 * @returns {Record<string, Node>}
 */
function birthDevice(state: Record<string, Node>, nodeName: string, deviceName: string, payload: UPayload): Record<string, Node> {
    const node = state[nodeName];
    if (!node) {
        return state;
    }

    return {
        ...state,
        [nodeName]: {
            ...node,
            devices: {
                ...node.devices,
                [deviceName]: {
                    state: PublisherState.Alive,
                    metrics: updateMetrics({}, payload.metrics)
                }
            }
        }
    };
}

/**
 * Sets a Node to stale
 * @param state 
 * @param name 
 * @param payload 
 * @returns {Record<string, Node>}
 */
function killNode(state: Record<string, Node>, name: string): Record<string, Node> {
    const node = state[name];
    if (!node) {
        return state;
    }

    return {
        ...state,
        [name]: {
            ...node,
            state: PublisherState.Dead
        }
    };
}

/**
 * Sets a Device to stale
 * @param state 
 * @param nodeName 
 * @param deviceName 
 * @param payload 
 * @returns {Record<string, Node>}
 */
function killDevice(state: Record<string, Node>, nodeName: string, deviceName: string): Record<string, Node> {
    const node = state[nodeName];
    if (!node) {
        return state;
    }

    const device = node.devices[deviceName];

    if (!device) {
        return state;
    }

    return {
        ...state,
        [nodeName]: {
            ...node,
            devices: {
                ...node.devices,
                [deviceName]: {
                    ...device,
                    state: PublisherState.Dead
                }
            }
        }
    };
}

const initialState: Record<string, Group> = {};

/**
 * The base reducer for the handling Sparkplug data
 */
const sparkplugReducer = createReducer(initialState, (builder) =>
    builder
        // When a payload is an update (NDATA/DDATA)
        .addCase(updateAction, (groups: Record<string, Group>, action) => {

            const sections = action.payload.id.split('/');

            const groupName = sections[0];
            const nodeName = sections[1];
            const deviceName = sections[2];

            return {
                ...groups,
                [groupName]: updateNode(
                    groups[groupName] || {},
                    nodeName,
                    action.payload.payload,
                    deviceName
                )
            };
        })
        // When a payload is a death (NDEATH/DDEATH)
        .addCase(deathAction, (state: Record<string, Group>, action) => {
            const sections = action.payload.split('/');
            const groupName = sections[0];
            const group = state[groupName];

            if (!group) {
                return state;
            }

            const nodeName = sections[1];
            const deviceName = sections[2];

            if (deviceName) {
                return {
                    ...state,
                    [groupName]: killDevice(group, nodeName, deviceName)
                };
            }

            return {
                ...state,
                [groupName]: killNode(group, nodeName)
            };
        })
        // When a payload is a birth (NBIRTH/DBIRTH)
        .addCase(birthAction, (state: Record<string, Group>, action) => {
            const sections = action.payload.id.split('/');
            const groupName = sections[0];
            const group = state[groupName] || {};

            const nodeName = sections[1];
            const deviceName = sections[2];

            if (deviceName) {
                return {
                    ...state,
                    [groupName]: birthDevice(group, nodeName, deviceName, action.payload.payload)
                };
            }

            return {
                ...state,
                [groupName]: birthNode(group, nodeName, action.payload.payload)
            };
        })
);

const store = configureStore(
    { reducer: sparkplugReducer }
);

/**
 * Monitors the Sparkplug Store for any changes done to the Sparkplug Groups
 * @param changed Callback that'll be fired with the updated groups
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeGroups(changed: (value: Record<string, Group>) => void) {
    function callback() {
        const nextState = store.getState();
        changed(nextState);
    }

    const unsubscribe = store.subscribe(callback);

    callback();
    return unsubscribe;
}

/**
 * Monitors the Sparkplug Store for any changes done to Nodes on a Sparkplug Group
 * @param {string} group The group to monitor
 * @param changed Callback that'll be fired with the updated Nodes
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeNodes(group: string, changed: (value: Record<string, Node>) => void) {
    let lastValue : Record<string, Node>;
    function callback() {
        const nextState = store.getState();
        if (lastValue !== nextState[group])
        {
            lastValue = nextState[group];
            changed(nextState[group]);
        }
    }

    const unsubscribe = store.subscribe(callback);

    callback();
    return unsubscribe;
}

/**
 * Monitors the Sparkplug Store for any changes done to Devices on a Sparkplug Node
 * @param {string} group The group of the node to monitor
 * @param {string} node The node to monitor
 * @param changed Callback that'll be fired with the updated Devices
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeDevices(group: string, node: string, changed: (value: Record<string, Device>) => void) {
    let lastValue : Record<string, Device>;
    function callback() {
        const nextState = store.getState();
        if (lastValue !== nextState[group] && nextState[group][node]?.devices)
        {
            lastValue = nextState[group] && nextState[group][node]?.devices;
            changed(lastValue);
        }
    }
        
    const unsubscribe = store.subscribe(callback);
        
    callback();
    return unsubscribe;
}

/**
 * Monitors the Sparkplug Store for any changes done to a Sparkplug Node
 * @param {string} group The group of the node to monitor
 * @param {string} node The node to monitor
 * @param changed Callback that'll be fired with the updated Node data
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeNode(group: string, node: string, changed: (value: Node) => void) {
    let lastValue : Node;
    function callback() {
        const nextState = store.getState();
        if (nextState[group] && nextState[group][node])
            if (lastValue !== nextState[group][node])
            {
                lastValue = nextState[group][node];
                changed(lastValue);
            }
    }
        
    const unsubscribe = store.subscribe(callback);
        
    callback();
    return unsubscribe;
}

/**
 * Monitors the Sparkplug Store for any changes done to a Sparkplug Device
 * @param {string} group The group of the device to monitor
 * @param {string} node The node of the device to monitor
 * @param {string} device The device to monitor
 * @param changed Callback that'll be fired with the updated Device data
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeDevice(group: string, node: string, device: string, changed: (value: Device) => void) {
    let lastValue : Device;
    function callback() {
        const nextState = store.getState();
        if (nextState[group] && nextState[group][node] && nextState[group][node].devices)
            if (lastValue !== nextState[group][node].devices[device])
            {
                lastValue = nextState[group][node].devices[device];
                changed(lastValue);
            }
    }
        
    const unsubscribe = store.subscribe(callback);
        
    callback();
    return unsubscribe;
}

declare type MetricsCallback = (value: Record<string, UMetric>) => void;

/**
 * Monitors the Sparkplug Store for any changes done to the Metrics on a Sparkplug Device
 * @param {string} group The group of the device to monitor
 * @param {string} node The node of the device to monitor
 * @param {string} device The device to monitor
 * @param changed Callback that'll be fired with the updated Metrics data
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeMetrics(group: string, node: string, device: string, changed: MetricsCallback) : Unsubscribe;
/**
 * Monitors the Sparkplug Store for any changes done to the Metrics on a Sparkplug Node
 * @param {string} group The group of the device to monitor
 * @param {string} node The node to monitor
 * @param changed Callback that'll be fired with the updated Metrics data
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeMetrics(group: string, node: string, changed: MetricsCallback) : Unsubscribe;

/**
 * Monitors the Sparkplug Store for any changes done to the Metrics on a Sparkplug Node/Device
 * @param {string} group The group of the device to monitor
 * @param {string} node The node of the device to monitor
 * @param {string | MetricsCallback} [device] Either the Device to Monitor, or a callback when the Node Metrics update
 * @param {MetricsCallback} [changed] If present, the callback that'll be fired with the updated Device Metrics data
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeMetrics(group: string, node: string, device: string | MetricsCallback, changed?: MetricsCallback)  : Unsubscribe {
   
    let lastValue : Record<string, UMetric>;
    function callback() {
        const nextState = store.getState();
        if (nextState[group] && nextState[group][node])
        {
            if (typeof device === 'string')
            {
                if (nextState[group][node].devices[device] && lastValue !== nextState[group][node].devices[device].metrics)
                {
                    lastValue = nextState[group][node].devices[device].metrics;
                    changed && changed(lastValue);
                }
            }
            else {
                if (lastValue !== nextState[group][node].metrics)
                {
                    lastValue = nextState[group][node].metrics;
                    device(lastValue);
                }
            }
            
        }
    }
    
        
    const unsubscribe = store.subscribe(callback);
        
    callback();
    return unsubscribe;
}

declare type MetricCallback = (value: UMetric) => void;

/**
 * Monitors the Sparkplug Store for any changes done to the Metric on a Sparkplug Device
 * @param {string} group The group of the metric to monitor
 * @param {string} node The node of the metric to monitor
 * @param {string} device The device of the metric to monitor
 * @param {string} metric The metric to monitor
 * @param changed Callback that'll be fired with the updated Metric data
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeMetric(group: string, node: string, device: string, metric: string, changed: MetricCallback) : Unsubscribe;
/**
 * Monitors the Sparkplug Store for any changes done to the Metric on a Sparkplug Node
 * @param {string} group The group of the metric to monitor
 * @param {string} node The node of the metric to monitor
 * @param {string} metric The metric to monitor
 * @param changed Callback that'll be fired with the updated Metric data
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeMetric(group: string, node: string, metric: string, changed: MetricCallback) : Unsubscribe;

/**
 * Monitors the Sparkplug Store for any changes done to the Metric on a Sparkplug Device
 * @param {string} group The group of the metric to monitor
 * @param {string} node The node of the metric to monitor
 * @param {string} device Either the name of the Device or Metric to monitor
 * @param {string | MetricCallback} [metric] Either the Metric to monitor, or a callback when the Node Metric updates
 * @param {MetricCallback} [changed] If present, the callback that'll be fired with the updated Device Metric data
 * @returns {Unsubscribe} Function to unsubscribe to the store
 */
export function observeMetric(group: string, node: string, device: string, metric: string | MetricCallback, changed?: MetricCallback)  : Unsubscribe {
   
    let lastValue : UMetric;
    function callback() {
        const nextState = store.getState();
        if (nextState[group] && nextState[group][node])
        {
            if (typeof metric === 'string')
            {
                if (nextState[group][node].devices[device] &&
                    nextState[group][node].devices[device].metrics[metric] &&
                    lastValue !== nextState[group][node].devices[device].metrics[metric])
                {
                    lastValue = nextState[group][node].devices[device].metrics[metric];
                    changed && changed(lastValue);
                }
            }
            else {
                if (nextState[group][node].metrics[device] &&
                    lastValue !== nextState[group][node].metrics[device]
                )
                {
                    lastValue = nextState[group][node].metrics[device];
                    metric(lastValue);
                }
            }
            
        }
    }

    const unsubscribe = store.subscribe(callback);

    callback();
    return unsubscribe;
}

export default {
    dispatch: store.dispatch
};