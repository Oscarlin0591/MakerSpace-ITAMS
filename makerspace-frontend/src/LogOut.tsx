import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';

function LogOut({ logOut }: { logOut: () => void }) {
  useEffect(() => {
    logOut();
  }, []);

  return <Navigate to="/" />;
}

export default LogOut;
