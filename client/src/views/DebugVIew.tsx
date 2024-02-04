import React, {  useState, useContext } from 'react';
import GroupAccordion from '../components/Group';
import SocketContext from '../utils/SocketHandler';
import { useGroups } from '../utils/Hooks';


function AddressInput(props: { onConfigure: (data: string) => void }) {
    const { onConfigure } = props;

    const [value, setValue] = useState<string>('');

    return <div><input onChange={(event) => {
        setValue(event.target.value);
    }
    } type={'text'}></input><button onClick={() => {
        onConfigure(value);
    }}>Set</button></div >;
}


/**
 * A view for displaying all Sparkplug Clients on a Primary Host
 * @returns {React.JSX.Element}
 */
function DebugView() {
    const socketHandler = useContext(SocketContext);
    const groups = useGroups();

    return (
        <>
            <AddressInput onConfigure={(address) => {
                socketHandler.configure(address);
            }}/>
            {groups.map((group) => {
                return (<GroupAccordion key={group} group={group}></GroupAccordion>);
            })}
        </>
    );
}

export default DebugView;
