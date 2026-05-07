import React, { useState, useEffect } from 'react';

export const ClockDisplay: React.FC = () => {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const date = new Date(time);
  
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const amPm = date.toLocaleTimeString('en-US', { hour12: true }).slice(-2);
  const mainTime = formattedTime.replace(/ [AP]M/, '');

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative font-mono font-bold tracking-tight text-white drop-shadow-xl select-none flex items-baseline">
        <span className="text-8xl md:text-[9rem] leading-none">{mainTime}</span>
        <span className="text-4xl md:text-5xl ml-4 opacity-80">{amPm}</span>
      </div>
      <div className="text-2xl md:text-3xl text-white/80 font-medium tracking-wide drop-shadow-md mt-4">
        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};
