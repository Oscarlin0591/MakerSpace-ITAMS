import { type ReactElement, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizeUser } from '../service/authorizationService.ts';

function AuthenticateRoute({ element }: {element: ReactElement}) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("requesting")
    authorizeUser().then(
      function(authorized) {
        console.log("authorized", authorized);
        if (!authorized) {
          navigate("/");
        }
      }
    )
  }, []);

  return element;
}

export default AuthenticateRoute;
