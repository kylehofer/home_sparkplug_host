import React from 'react';
import { UPropertySet } from '../utils/sparkplugbpayload';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Property from './Property';

/**
 * Represents an accordian menu for a Sparkplug Property Set
 * @param {Object} props
 * @param {string} [props.name] If set, it represents the name of the nested property set
 * @param {UPropertySet} props.propertySet The property set
 * @returns {React.JSX.Element}
 */
function PropertySetAccordion(props: { name?: string | undefined, propertySet: UPropertySet }) {
    const { propertySet, name } = props;
    return (
        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >{name || 'Properties'}</AccordionSummary>
            <AccordionDetails>
                {Object.keys(propertySet).map((key) => {
                    const value = propertySet[key];
                    // Creating nested property sets
                    if (value.type == 'PropertySet') {

                        return <PropertySetAccordion
                            key={key}
                            name={key}
                            // @ts-expect-error The data in our store is from a Sparkplug Protobuf. The `type` property defines the data stored in this type, and we can ignore TS type checking here.
                            propertySet={value.value}
                        />;
                    }

                    return <Property
                        key={key}
                        name={key}
                        property={value}
                    />;
                })}
            </AccordionDetails>
        </Accordion>
    );
}


export default PropertySetAccordion;