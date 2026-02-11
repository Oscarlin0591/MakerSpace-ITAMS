import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ManageInventory } from './pages/ManageInventory.tsx';
import Login from './pages/Login.tsx';
import MailingList from './pages/MailingList';
import TopNavbar from './components/TopNavbar';
import type { JSX } from 'react/jsx-runtime';
import { useCookies } from 'react-cookie';
import LogOut from './LogOut.tsx';
import axios from 'axios';

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  // Redirects to the login if the user is authenticated.
  function checkForAuthentication(element: JSX.Element) {
    if (cookies.token) {
      return element;
    } else {
      return <Navigate to="/" />;
    }
  }

  function setToken(token: string) {
    setCookie('token', token);
    axios.defaults.headers.common['Authorization'] = token;
  }

  function removeToken() {
    removeCookie('token');
    axios.defaults.headers.common['Authorization'] = undefined;
  }

  return (
    <BrowserRouter>
      <NavbarLimiter />
      <Routes>
        <Route path="/manage-inventory" element={checkForAuthentication(<ManageInventory />)} />
        <Route path="/home" element={checkForAuthentication(<Dashboard />)} />
        <Route
          path="/"
          element={cookies.token ? <Navigate to="/home" /> : <Login setToken={setToken} />}
        />
        <Route path="/mailing-list" element={checkForAuthentication(<MailingList />)} />
        <Route path="/logout" element={checkForAuthentication(<LogOut logOut={removeToken} />)} />
      </Routes>
    </BrowserRouter>
  );
}

// Hide navbar on the root login route
function NavbarLimiter() {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return <TopNavbar />;
}
export default App;
