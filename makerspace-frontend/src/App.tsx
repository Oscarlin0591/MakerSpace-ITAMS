import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ManageInventory } from './pages/ManageInventory.tsx';
import Login from './pages/Login.tsx';
import MailingList from './pages/MailingList';
import TopNavbar from './components/TopNavbar';
import type { JSX } from 'react/jsx-runtime';
import { useCookies } from 'react-cookie';
import LogOut from './LogOut.tsx';

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['loggedIn']);

  // Redirects to the login if the user is authenticated.
  function checkForAuthentication(element: JSX.Element) {
    if (cookies.loggedIn) {
      return element;
    } else {
      return <Navigate to="/" />;
    }
  }

  function logIn() {
    setCookie('loggedIn', true);
  }

  function logOut() {
    removeCookie('loggedIn');
  }

  return (
    <BrowserRouter>
      <TopNavbar />
      <Routes>
        <Route path="/manage-inventory" element={checkForAuthentication(<ManageInventory />)} />
        <Route path="/home" element={checkForAuthentication(<Dashboard />)} />
        <Route
          path="/"
          element={cookies.loggedIn ? <Navigate to="/home" /> : <Login setIsLoggedIn={logIn} />}
        />
        <Route path="/mailing-list" element={checkForAuthentication(<MailingList />)} />
        <Route path="/logout" element={checkForAuthentication(<LogOut logOut={logOut} />)} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
