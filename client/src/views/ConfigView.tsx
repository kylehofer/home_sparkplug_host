import React from 'react';

import { FormControl, FormHelperText, Input, InputLabel } from '@mui/material';

/**
 * 
 * @returns 
 */
function ConfigView() {

    return (
        <FormControl>
            <InputLabel htmlFor="test">Temp Input</InputLabel>
            <Input id="test" aria-describedby="my-helper-text" />
            <FormHelperText id="test-text">Something or whatever.</FormHelperText>
        </FormControl>

    );
}

export default ConfigView;
