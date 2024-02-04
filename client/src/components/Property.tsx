import React from 'react';
import { UPropertyValue } from '../utils/sparkplugbpayload';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * Represents an accordian menu for a Sparkplug Property
 * @param {Object} props
 * @param {string} props.name The name of the property
 * @param {UPropertyValue} props.property The property
 * @returns {React.JSX.Element}
 */
function PropertyAccordion(props: { name: string, property: UPropertyValue }) {
    const { property, name } = props;
    return (
        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >{name}</AccordionSummary>
            <AccordionDetails>
                <span><b>Value: </b> {`${property.value}`}</span><br></br>
                <span><b>Type: </b> {`${property.type}`}</span>
            </AccordionDetails>
        </Accordion>
    );
}


export default PropertyAccordion;