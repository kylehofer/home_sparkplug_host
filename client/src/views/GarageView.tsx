import React, { useContext, useMemo } from 'react';
import { Box } from '@mui/system';
import { useMetric } from '../utils/Hooks';
import SocketContext from '../utils/SocketHandler';

const gridContainer = {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    width: '66%',
    minHeight: '200px'
};

const internal = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    width: '66%',
    minHeight: '200px'
};

const gridItem = {
    margin: '8px',
    border: '1px solid white',
    borderRadius: '9px'
};


/**
 * 
 * @returns 
 */
function GarageView() {

    const socketHandler = useContext(SocketContext);
    const position = useMetric('Garage', 'Door', 'position');
    const state = useMetric('Garage', 'Door', 'state');
    const result = useMetric('Garage', 'Door', 'result');

    const resultString = useMemo(() => {
        /* @ts-expect-error asdasd */
        const int: number = result?.value;
        switch (int) {
        case 0:
            return 'NONE';
        case 1:
            return 'SUCCESS';
        default:
            return 'FAIL';
        }
    }, [result && result.value]);

    const stateString = useMemo(() => {
        /* @ts-expect-error asdasd */
        const int: number = state?.value;
        switch (int) {
        case 0:
            return 'ACTIVE';
        case 1:
            return 'MONITOR';
        case 2:
            return 'START';
        case 3:
            return 'STOP';
        default:
            return 'IDLE';
        }
    }, [state && state.value]);

    const topic = 'Garage/NCMD/Door';

    return (
        <center>
            <Box sx={gridContainer}>
                <Box onClick={() => { }} sx={gridItem}>Garage Door
                    <Box sx={internal}>
                        {/* @ts-expect-error asdasd */}
                        <label>Position: </label><span>{position?.value}</span>
                        <label>Result: </label><span>{resultString}</span>
                        <label>State: </label><span>{stateString}</span>
                        <button onClick={() => {
                            position && socketHandler.send(topic, {
                                ...position,
                                value: 100
                            });
                        }}>Open</button>
                        <button onClick={() => {
                            position && socketHandler.send(topic, {
                                ...position,
                                value: 0
                            });
                        }}>Close</button>
                    </Box>


                </Box>
            </Box>
        </center>
    );
}

export default GarageView;
