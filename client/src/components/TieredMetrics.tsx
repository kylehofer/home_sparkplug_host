import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMetricTiers, useMetrics } from '../utils/Hooks';
import MetricAccordion from './Metric';

/**
 * Builds a nested set of sub folders based off the Sparkplug Metric names
 * @param {Object} props
 * @param {string} props.group The group the metrics belongs to
 * @param {string} props.node The node the metrics belongs to
 * @param {string} [props.device] If present, the device the metrics belongs to
 * @param {string} [props.prefix] If present, the parent folder/s the metric belongs to
 * @returns {React.JSX.Element}
 */
function MetricSubfolder(props: { 
    group: string,
    node: string,
    device?: string,
    prefix?: string,
    metricCollection: Array<string>
})
{
    const { group, node, device, prefix, metricCollection } = props;
    const [metrics, folders] = useMetricTiers(metricCollection);

    return (
        <>
            {Object.keys(folders).map((folder) => {
                return <Accordion key={folder} slotProps={{ transition: { unmountOnExit: true } }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        
                    >{folder}</AccordionSummary>
                    <AccordionDetails>
                        <MetricSubfolder
                            group={group}
                            node={node}
                            device={device}
                            prefix={prefix ? `${prefix}/${folder}` : folder}
                            metricCollection={folders[folder]}
                        ></MetricSubfolder>
                    </AccordionDetails>
                </Accordion>;
            })}
            
            {metrics.map((metric) => {
                return (
                    <MetricAccordion
                        key={metric}
                        group={group}
                        node={node}
                        device={device}
                        metric={prefix ? `${prefix}/${metric}` : metric}
                    ></MetricAccordion>);
            })}
        </>
    );
}

/**
 * Builds an accordian menu for Sparkplug Metrics where their folder structure 
 * is represented as sub accordian menus
 * @param {Object} props
 * @param {string} props.group The group the metrics belongs to
 * @param {string} props.node The node the metrics belongs to
 * @param {string} [props.device] If present, the device the metrics belongs to
 * @returns {React.JSX.Element}
 */
function TieredMetrics(props: { group: string, node: string, device?: string}) {
    const { group, node, device } = props;

    const metricCollection = useMetrics(group, node, device);

    return (

        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                
            >Metrics</AccordionSummary>
            <AccordionDetails>
                <MetricSubfolder
                    group={group}
                    node={node}
                    device={device}
                    metricCollection={metricCollection}
                ></MetricSubfolder>
            </AccordionDetails>
        </Accordion>

    );
}


export default TieredMetrics;