
import React from 'react';

const Trophy = ({ className = "" }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8"></path>
    <path d="M12 17v4"></path>
    <path d="M17 7V4H7v3a5 5 0 0 0 10 0Z"></path>
    <path d="M17 4h3a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4h-2"></path>
    <path d="M7 4H4a1 1 0 0 0-1 1v3a4 4 0 0 0 4 4h2"></path>
  </svg>
);

export default Trophy;
