import React, { useMemo } from 'react';
import DeviceAccordion from './Device';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useDevices, usePublisherState, usePublisherTimeStamp } from '../utils/Hooks';
import { PublisherState } from '../redux/store';
import TieredMetrics from './TieredMetrics';

/**
 * Represents an accordian menu for a Sparkplug Node
 * @param {Object} props
 * @param {string} props.group The group the node belongs to
 * @param {string} props.node The name of the node
 * @returns {React.JSX.Element}
 */
function NodeAccordion(props: { node: string, group: string }) {
    const { node, group } = props;

    const devices = useDevices(group, node);
    const state = usePublisherState(group, node);
    const timestamp = usePublisherTimeStamp(group, node);

    const timeDisplay = useMemo(() => {
        return new Date(timestamp).toLocaleString();
    },[timestamp]);

    return (
        <Accordion disabled={state === PublisherState.Dead} slotProps={{ transition: { unmountOnExit: true } }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                
            >{node}</AccordionSummary>
            <AccordionDetails>
                <span>Last Valid Message: {timeDisplay}</span>
                {devices.length > 0 && <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        
                    >Devices</AccordionSummary>
                    <AccordionDetails>
                        {devices.map((device) => {
                            return (<DeviceAccordion key={device} group={group} node={node} device={device}></DeviceAccordion>);
                        })}
                    </AccordionDetails>
                </Accordion>}
                <TieredMetrics group={group} node={node}></TieredMetrics>
            </AccordionDetails>
        </Accordion >
    );
}


export default NodeAccordion;