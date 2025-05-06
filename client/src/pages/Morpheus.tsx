import React, { useEffect } from 'react';
import MorpheusContainer from '../components/morpheus/MorpheusContainer';

const Morpheus: React.FC = () => {
  // Set body class to enforce dark mode for Morpheus
  useEffect(() => {
    // Add dark mode class
    document.documentElement.classList.add('dark');
    
    // Remove the class when component unmounts
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);
  
  return (
    <div className="h-screen bg-background text-foreground">
      <MorpheusContainer />
    </div>
  );
};

export default Morpheus;