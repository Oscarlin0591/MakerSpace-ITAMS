import { type ReactElement, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/user';

type AuthRouteProps = {
  element: ReactElement;
  adminOnly?: boolean;
};

function AuthenticateRoute({ element, adminOnly = false }: AuthRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useUser();

  console.log('AuthenticateRoute - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin, 'adminOnly:', adminOnly);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      console.log('Not authenticated. Redirect to login');
      navigate('/');
      return;
    }

    // Check admin privilege for admin page
    if (adminOnly && !isAdmin) {
      console.log('Denied access: Admin privilege required');
      navigate('/home');
    }
  }, [isAuthenticated, isAdmin, adminOnly, navigate]);

  return element;
}

export default AuthenticateRoute;
