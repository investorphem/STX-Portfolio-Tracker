import React from 'react';

const Logo = ({ className = "h-8 w-8", ...props }) => (
  <svg 
    viewBox="0 0 100 100" // Define the coordinate system
    className={className} // Let Tailwind or CSS handle the size
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    {...props}
  >
    {/* Block 1 (Left - Darker Orange) */}
    <path 
      d="M30 20 H60 V45 L30 80 V20 Z" 
      fill="#c2410c" // Deep Orange
    />
    
    {/* Block 2 (Right - Stacks Orange) */}
    <path 
      d="M40 20 H70 V80 L40 55 V20 Z" 
      fill="#f97316" // Stacks Orange
    />
  </svg>
);

export default Logo;
