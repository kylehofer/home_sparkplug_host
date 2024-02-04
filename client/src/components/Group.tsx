import React from 'react';
import NodeAccordion from './Node';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNodes } from '../utils/Hooks';


/**
 * Represents an accordian menu for a Sparkplug Group
 * @param {Object} props
 * @param {string} props.group The group the device belongs to
 * @returns {React.JSX.Element}
 */
function GroupAccordion(props: { group: string}) {
    const { group } = props;

    const nodes = useNodes(group);

    return (
        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                
            >{group}</AccordionSummary>
            <AccordionDetails>
                {nodes.map((node) => {
                    return (<NodeAccordion key={node} node={node} group={group} ></NodeAccordion>);
                })}
            </AccordionDetails>
        </Accordion>
    );
}


export default GroupAccordion;