import React, { useMemo } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PublisherState } from '../redux/store';
import { usePublisherState, usePublisherTimeStamp } from '../utils/Hooks';
import TieredMetrics from './TieredMetrics';

/**
 * Represents an accordian menu for a Sparkplug Device
 * @param {Object} props
 * @param {string} props.group The group the device belongs to
 * @param {string} props.node The node the device belongs to
 * @param {string} props.device The name of the device
 * @returns {React.JSX.Element}
 */
function DeviceAccordion(props: { group: string, node: string, device: string}) {
    const { device, group, node } = props;
    const state = usePublisherState(group, node, device);

    const timestamp = usePublisherTimeStamp(group, node, device);

    const timeDisplay = useMemo(() => {
        return new Date(timestamp).toLocaleString();
    },[timestamp]);

    return (
        <Accordion disabled={state === PublisherState.Dead}  slotProps={{ transition: { unmountOnExit: true } }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                
            >{device}</AccordionSummary>
            <span>Last Valid Message: {timeDisplay}</span>
            <AccordionDetails>
                <TieredMetrics group={group} node={node} device={device}></TieredMetrics>
            </AccordionDetails>
        </Accordion>
    );
}


export default DeviceAccordion;