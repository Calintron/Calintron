// Navbar.js
import React, { useState } from 'react';
import './Navbar.css'; // Ensure you create this CSS file for styling

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`navbar ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={toggleNavbar}>
        {isOpen ? 'Close' : 'Menu'}
      </button>
      <ul>
        <li><a href="#"></a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
