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
import AuthenticateRoute from './components/AuthenticateRoute.tsx';
import { UserProvider } from './contexts/user';

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['token', 'isAdmin']);

  if (cookies.token) {
    axios.defaults.headers.common['Authorization'] = cookies.token;
  }

  // Ensure axios sends the auth header when app initializes and a cookie exists
  useEffect(() => {
    if (cookies.token) {
      axios.defaults.headers.common['Authorization'] = cookies.token;
    }
  }, [cookies.token]);

  function setToken(token: string, isAdmin: boolean) {
    // Accessible on all pages; Allow cookie to exist for 24hrs
    const options = { path: '/', maxAge: 86400 };

    setCookie('token', token, options);
    setCookie('isAdmin', isAdmin.toString(), options);
    axios.defaults.headers.common['Authorization'] = token;
  }

  function removeToken() {
    const options = { path: '/' };

    removeCookie('token', options);
    removeCookie('isAdmin', options);
    axios.defaults.headers.common['Authorization'] = undefined;
  }

  return (
    <UserProvider>
      <BrowserRouter>
        <NavbarLimiter />
        <Routes>
          <Route path="/" element={<Login setToken={setToken} />} />

          {/* Authenticated User Routes */}
          <Route path="/home" element={<AuthenticateRoute element={<Dashboard />} />} />
          <Route
            path="/manage-inventory"
            element={<AuthenticateRoute element={<ManageInventory />} />}
          />

          {/* Admin Protected Routes */}
          <Route
            path="/mailing-list"
            element={<AuthenticateRoute element={<MailingList />} adminOnly={true} />}
          />

          <Route path="/logout" element={<LogOut logOut={removeToken} />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

// Hide navbar on the root login route
function NavbarLimiter() {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return <TopNavbar />;
}
export default App;
