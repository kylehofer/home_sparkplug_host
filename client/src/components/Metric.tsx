import React, { useState, useMemo, useContext} from 'react';
import { UMetric } from '../utils/sparkplugbpayload';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PropertySetAccordion from './PropertySet';
import { useMetric } from '../utils/Hooks';
import SocketContext from '../utils/SocketHandler';

/**
 * A simple input for providing basic commands
 * @param {Object} props
 * @param {string} props.topic The topic the command will be posted to
 * @param {UMetric} props.metric The metric base to use for the command
 * @returns {React.JSX.Element}
 */
function WritableInput(props: { metric: UMetric, topic: string }) {
    const { metric, topic } = props;
    const [value, setValue] = useState<string | number | boolean>('');
    const [isNull, setIsNull] = useState<boolean>(true);

    const socketHandler = useContext(SocketContext);

    // Basic type mapping to Input types
    const type = useMemo(() => {
        switch (metric.type) {
        case 'Int8':
        case 'Int16':
        case 'Int32':
        case 'Int64':
        case 'UInt8':
        case 'UInt16':
        case 'UInt32':
        case 'UInt64':
        case 'Float':
        case 'Double':
            return 'number';
        case 'Boolean':
            return 'checkbox';
        case 'Text':
        case 'String':
            return 'text';
        default:
            return 'text';
        }

    }, [metric.type]);
    return <div>
        <label htmlFor="command">Command: </label>
        <input
            id={'command'}
            onChange={
                (event) => {
                    if (metric.type == 'Boolean') {
                        setValue(event.target.checked);
                    }    else if (type == 'number') {
                    // Converting to number
                        setValue(+event.target.value);
                    }
                    else
                        setValue(event.target.value);
                }
            }
            disabled={isNull}
            type={type}
        />
        <label htmlFor="isNull">IsNull: </label>
        <input 
            id={'isNull'} onChange={
                (event) => {
                    setIsNull(event.target.checked);
                }
            }
            type={'checkbox'}
            checked={isNull}
        />
        <button onClick={() => {
            socketHandler.send(topic, {
                ...metric,
                isNull: isNull,
                value: isNull ? null : value
            });
        }}>Set</button></div >;
}

/**
 * Represents an accordian menu for a Sparkplug Metric
 * @param {Object} props
 * @param {string} props.group The group the metric belongs to
 * @param {string} props.node The node the metric belongs to
 * @param {string} [props.device] If present, the device the metric belongs to
 * @param {string} props.metric The name of the metric
 * @returns {React.JSX.Element}
 */
function MetricAccordion(props: {
    group: string,
    node: string,
    device?: string,
    metric: string,
    name: string  }) {

    const { group, node, device, metric, name } = props;


    const uMetric = device ? useMetric(group, node, device, metric) : useMetric(group, node, metric);

    
    // Could be potentially unloaded, we should return nothing in this case
    if (!uMetric)
    {
        return <></>;
    }
    
    // I'm using the writable/readOnly properties to determine whether or not the metric is a command
    const isWritable = (uMetric.name && (uMetric.name.indexOf('Node Control/') == 0)) ||
        (uMetric.properties && Object.keys(uMetric.properties).some((key) => {
        // @ts-expect-error We've checked the properties exist above
            return (key === 'writable' && uMetric.properties[key].value) || (key === 'readOnly' && !uMetric.properties[key].value);
        }));

    return (
        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >{name}</AccordionSummary>
            <AccordionDetails>
                {uMetric.properties && <PropertySetAccordion
                    propertySet={uMetric.properties}
                />}
                
                {isWritable &&
                    <WritableInput
                        topic={`${group}/${device ? 'DCMD' : 'NCMD'}/${node}${device ? `/${device}` : ''}`}
                        metric={uMetric}
                    />}
                <span><b>Value: </b> {`${uMetric.value}`}</span><br></br>
                <span><b>Type: </b> {`${uMetric.type}`}</span>
            </AccordionDetails>
        </Accordion>
    );
}


export default MetricAccordion;