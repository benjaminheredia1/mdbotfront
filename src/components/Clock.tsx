import { useTimer } from 'react-timer-hook';

// Definimos qué tipo de datos espera recibir el componente
interface ClockProps {
  createdAt: string | Date; // Aceptamos string (ISO) o un objeto Date
}

const Clock = ({ createdAt }: ClockProps) => {
  // 1. Calculamos el tiempo de expiración
  // Convertimos createdAt a objeto Date por si viene como string
  const expiryTimestamp = new Date(new Date(createdAt).getTime() + 5 * 60 * 1000);

  // 2. Configuramos el hook
  const {
    seconds,
    minutes,
    isRunning,
  } = useTimer({ 
    expiryTimestamp, 
    onExpire: () => console.warn('¡Tiempo terminado!') 
  });

  // Función helper tipada (num es un número)
  const format = (num: number) => String(num).padStart(2, '0');

  // Si ya terminó, mostramos el estado expirado
  if (!isRunning) {
    return (
       <div className='bg-red-500 text-white rounded-full px-2 min-w-[5rem] h-5 text-center flex items-center justify-center text-xs font-bold'>
         Expirado
       </div>
    );
  }

  // Mientras corre
  return (
    <div className='bg-yellow-500 text-white rounded-full px-2 min-w-[5rem] h-5 text-center flex items-center justify-center text-xs font-bold'>
      {format(minutes)}:{format(seconds)}
    </div>
  );
};

export default Clock;