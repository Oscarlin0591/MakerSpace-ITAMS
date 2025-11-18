// Dashboard (Da Tsx file) Brandon McCrave 11/16/2025 Initial Creation


import React from 'react';

import './Dashboard.css';


export function Dashboard() {
    return (
        <header className="dashboard-header">
            <div className="dashboard-container">
                <h1> Dashboard </h1>
            </div>

        <div className='Dashboard-nav-bar'>
                {/* <img className="logo" src={Logo}/> */}
        </div>

        <nav className="dashboard-links">
          <a href="#">Home</a>
          <a href="#">Notifications</a>
          <a href="#">Manage Inventory</a>
          <a href="#">Logout</a>
        </nav>
        </header>
    );
}