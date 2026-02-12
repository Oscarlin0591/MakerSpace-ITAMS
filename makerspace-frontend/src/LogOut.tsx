import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

function LogOut({ logOut }: { logOut: () => void }) {
  useEffect(() => {
    logOut();
  }, []);

  return <Navigate to="/" />;
}

export default LogOut;
