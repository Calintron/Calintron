// Sidebar.js
import React, { useState } from 'react';
import './Sidebar.css'; // Ensure you create this CSS file for styling

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? 'Close' : 'Open'}
      </button>
      <ul className='mt-2'>
        <li><a href="#">SetCommonMenu</a></li>
        <li><a href="#">Iniital Menu</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;
