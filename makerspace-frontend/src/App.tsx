import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ManageInventory } from './pages/ManageInventory.tsx';
import Login from './pages/Login.tsx';
import MailingList from './pages/MailingList';
import TopNavbar from './components/TopNavbar';
import { useCookies } from 'react-cookie';
import { useEffect } from 'react';
import LogOut from './components/LogOut.tsx';
import axios from 'axios';
import Yolo from './pages/Yolo.tsx';
import AuthenticateRoute from './components/AuthenticateRoute.tsx';

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

  if (cookies.token) {
    axios.defaults.headers.common['Authorization'] = cookies.token;
  }

  // Ensure axios sends the auth header when app initializes and a cookie exists
  useEffect(() => {
    if (cookies.token) {
      axios.defaults.headers.common['Authorization'] = cookies.token;
    }
  }, [cookies.token]);

  function setToken(token: string) {
    setCookie('token', token);
    axios.defaults.headers.common['Authorization'] = cookies.token;
  }

  function removeToken() {
    removeCookie('token');
    axios.defaults.headers.common['Authorization'] = undefined;
  }

  return (
    <BrowserRouter>
      <NavbarLimiter />
      <Routes>
        <Route path="/manage-inventory" element={<AuthenticateRoute element={<ManageInventory />} />} />
        <Route path="/home" element={<AuthenticateRoute element={<Dashboard />}/>} />
        <Route
          path="/"
          element={<Login setToken={setToken} />}
        />
        <Route path="/yolo" element={<AuthenticateRoute element={<Yolo/>} />} />
        <Route path="/mailing-list" element={<AuthenticateRoute element={<MailingList />}/>} />
        <Route path="/logout" element={<LogOut logOut={removeToken} />} />
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
