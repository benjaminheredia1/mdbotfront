import React from 'react';
import { useTimer } from 'react-timer-hook';

const CountdownBadge = ({ createdAt }) => {
    const expiryTimestamp = new Date(new Date(createdAt).getTime() + 5 * 60 * 1000);

    const {
        seconds,
        minutes,
        isRunning,
    } = useTimer({ expiryTimestamp, onExpire: () => console.warn('¡Tiempo terminado!') });

    const format = (num) => String(num).padStart(2, '0');

    if (!isRunning) {
        return (<>
            Expirado
        </>
        );
    }

    return (
        <>
            <div className='bg-yellow-500 text-white rounded-full px-2 min-w-[5rem] h-5 text-center flex items-center justify-center text-xs font-bold'>
                {format(minutes)}:{format(seconds)}
            </div>
        </>
    );
};

export default CountdownBadge;