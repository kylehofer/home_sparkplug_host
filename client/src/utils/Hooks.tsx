import {useEffect, useState, useMemo} from 'react';
import { PublisherState, observeMetrics, observeNodes, observeGroups, observeDevices, observeNode, observeDevice, observeMetric } from '../redux/store';
import { UMetric } from './sparkplugbpayload';

/**
 * Utility function to compare an array of keys to a Record
 * Used to reduce the number of renders when monitoring changes to the Sparkplug Store
 * Useful for creating sets of items whom you only want to update when the total set changes, not the items
 * @param base An array of keys
 * @param input The Record whom which the Array of keys will be compared too
 * @returns {Array<String>} Will return the base if nothing changed, or the new set of keys
 */
function keyCheck(base: Array<string>, input: Record<string, unknown>)
{
    const keys = Object.keys(input);
    if (keys.length !== base.length || !keys.every((key) => base.includes(key)))
    {
        return keys;
    }
    return base;
}

/**
 * Returns an array of Device names on a Node
 * @param group The group whom the devices belong
 * @param node The node whom the devices belong
 * @returns {Array<string>}
 */
export function useDevices(group: string, node: string)
{
    const [result, setDevices] = useState<Array<string>>([]);
    useEffect(() => {
        return observeDevices(group, node, (devices) => {
            setDevices((values) => {
                return keyCheck(values, devices);
            });
        });
    }, []);

    return result;
}

/**
 * Returns an array of Nodes names on a Group
 * @param group The group whom the nodes belong
 * @returns {Array<string>}
 */
export function useNodes(group: string)
{
    const [result, setNodes] = useState<Array<string>>([]);
    useEffect(() => {
        return observeNodes(group, (nodes) => {
            setNodes((values) => {
                return keyCheck(values, nodes);
            });
        });
    }, []);

    return result;
}

/**
 * Returns an array of Groups on the Store
 * @returns {Array<string>}
 */
export function useGroups()
{
    const [result, setGroups] = useState<Array<string>>([]);
    useEffect(() => {
        return observeGroups((groups) => {
            setGroups((values) => {
                return keyCheck(values, groups);
            });
        });
    }, []);

    return result;
}

/**
 * Gets the Publisher State of a Node/Device (Dead/Alive)
 * @param group The group where the Node or Device sits
 * @param node Either the Node to watch, or the Node of the Device
 * @param {string} [device] If present, the Device to montior
 * @returns {PublisherState}
 */
export function usePublisherState(group: string, node: string, device?: string)
{
    const [result, setState] = useState<PublisherState>(PublisherState.Dead);
    useEffect(() => {
        if (device)
        {
            return observeDevice(group, node, device, (publisher) => {
                publisher && setState(publisher.state);
            });
        }
        
        return observeNode(group, node, (publisher) => {
            publisher && setState(publisher.state);
        });
    }, []);

    return result;
}

/**
 * Gets a list of a Metrics on a Node/Device
 * @param group The group where the Node or Device sits
 * @param node Either the Node to watch, or the Node of the Device
 * @param {string} [device] If present, the Device to montior
 * @returns {Array<string>}
 */
export function useMetrics(group: string, node: string, device?: string)
{
    const [result, setMetrics] = useState<Array<string>>([]);
    useEffect(() => {
        if (device)
        {
            return observeMetrics(group, node, device, (metrics) => {
                setMetrics((values) => {
                    return keyCheck(values, metrics);
                });
            });
        }
        
        return observeMetrics(group, node, (metrics) => {
            setMetrics((values) => {
                return keyCheck(values, metrics);
            });
        });
    }, []);

    return result;
}

/**
 * Gets the data for a metric from the store
 * @param group The group the metric belongs to
 * @param node The node the metric belongs to
 * @param device The device the metric belongs to
 * @param metric The name of the metric
 * @returns {UMetric | undefined}
 */
export function useMetric(group: string, node: string, device: string, metric: string) : UMetric | undefined;

/**
 * Gets the data for a metric from the store
 * @param group The group the metric belongs to
 * @param node The node the metric belongs to
 * @param metric The name of the metric
 * @returns {UMetric | undefined}
 */
export function useMetric(group: string, node: string, metric: string) : UMetric | undefined;

/**
 * Gets the data for a metric from the store
 * @param group The group the metric belongs to
 * @param node The node the metric belongs to
 * @param device Either the name of the metric, or the device the metric belongs to
 * @param {string} [metric] If present, the name of the metric
 * @returns {UMetric | undefined}
 */
export function useMetric(group: string, node: string, device: string, metric?: string)
{
    const [result, setMetric] = useState<UMetric | undefined>(undefined);
    useEffect(() => {
        if (metric)
        {
            return observeMetric(group, node, device, metric, (metric) => {
                setMetric(metric);
            });
        }
        
        return observeMetric(group, node, device, (metric) => {
            setMetric(metric);
        });
    }, []);

    return result;
}

/**
 * Utility function for splitting the tier structure of Metrics based of '/'
 * All metrics on the current tier will be returned as a flat array of strings
 * The other tiers will be grouped and returned as a Record of tier to array mapping
 * @param metricCollection The collection of metrics to monitor
 * @returns {[Array<string>, Record<string, Array<string>>]}
 */
export function useMetricTiers(metricCollection: Array<string>) : [Array<string>, Record<string, Array<string>>] {
    return useMemo(() => {
        const metrics : Array<string> = [];
        const folders: Record<string, Array<string>> = {};

        metricCollection.forEach((name) => {
            const slashPosition = name.indexOf('/');
            if (slashPosition > 0) {
                const part = name.substring(0, slashPosition);
                const other = name.substring(slashPosition + 1);
                if (!folders[part])
                {
                    folders[part] = [other];
                }
                else
                {
                    folders[part].push(other);
                }
            }
            else
            {
                metrics.push(name);
            }
        });

        return [metrics, folders];
    }, [metricCollection]);
}