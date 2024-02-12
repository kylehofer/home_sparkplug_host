import React, { useState } from 'react';
import { Box } from '@mui/system';
import GarageView from './GarageView';
import DebugView from './DebugVIew';
import ConfigView from './ConfigView';
import { MenuItem } from '@mui/material';

const headerContainer = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    width: '100%',
    minHeight: '33px'
};

interface MenuItem {
    name: string,
    Element: React.JSX.Element
}

interface MenuItemProps {
    item: MenuItem,
    onActive: (item: MenuItem) => void,
    className?: string
}

function MenuButton(props: MenuItemProps) {
    const {  onActive, className, item } = props;
    return (
        <Box className={`menuItem ${className || ''}`} onClick={() => { onActive(item); }}>{item.name}</Box>
    );
}



const MENU : Array<MenuItem> = [
    {
        name: 'Garage',
        Element: <GarageView />
    },
    {
        name: 'Debug',
        Element: <DebugView />
    },
    {
        name: 'Config',
        Element: <ConfigView />
    }    
];

/**
 * 
 * @returns 
 */
function Application() {
    const [item, setItem] = useState(MENU[0]);
    return (
        <>
            <header>
                <Box sx={headerContainer}>
                    {MENU.map((menuItem) => {
                        return (<MenuButton
                            className={(item === menuItem) ? 'active' : ''}
                            key={menuItem.name}
                            item={menuItem}
                            onActive={(item) => {
                                setItem(item);
                            }}
                        />);
                    })}
                
                </Box>
            </header>
            <main id="content">
                {item.Element}
            </main>
        </>
    );
}

export default Application;
