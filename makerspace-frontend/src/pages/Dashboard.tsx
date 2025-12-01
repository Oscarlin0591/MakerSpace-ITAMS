// Dashboard (Da Tsx file) Brandon McCrave 11/16/2025 Initial Creation

import './Dashboard.css';
import Logo from '../assets/Logo.svg';
import StockLevelsChart from '../features/StockLevelsChart';
import { ActivityChart } from '../features/StorageActivityChart';
import { Link } from 'react-router-dom';

// routing not used in this file; keep Dashboard focused on charts

export function Dashboard() {
  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div className="dashboard-container">
          <div className="dashboard-logo">
            <img src={Logo} alt="MakerSpace Logo" />
          </div>
          <h1>Dashboard</h1>
        </div>

        <div className="Dashboard-nav-bar">{/* navigation area */}</div>

        <nav className="dashboard-links">
          <Link to="/home">Home</Link>
          <Link to="/mailing-list">Notifications</Link>
          <Link to="/manage-inventory">Manage Inventory</Link>
          <Link to="/logout">Logout</Link>
        </nav>
      </header>

      <main className="dashboard-main">
        <section className="charts-row">
          <div className="chart-column">
            <ActivityChart />
          </div>

          <div className="chart-column">
            <StockLevelsChart />
          </div>
        </section>
      </main>
    </div>
  );
}
