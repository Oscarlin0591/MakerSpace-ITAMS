import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

function LogOut({ logOut }: { logOut: () => void }) {
  useEffect(() => {
    logOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Navigate to="/" />;
}

export default LogOut;
