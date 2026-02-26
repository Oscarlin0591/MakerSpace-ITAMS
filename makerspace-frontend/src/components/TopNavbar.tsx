import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BoxArrowRight } from 'react-bootstrap-icons';
import Logo from '../assets/Logo.svg';
import { useUser } from '../contexts/user';

export default function TopNavbar() {
  const { isAdmin, isAuthenticated } = useUser();

  if (!isAuthenticated) return null;

  return (
    <Navbar expand="lg" sticky="top" data-bs-theme="dark" className="top-navbar px-3">
      <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center me-5">
        <img src={Logo} alt="MakerSpace" className="navbar-logo" />
        <span className="gold-text">ITAMS</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="main-nav" />
      <Navbar.Collapse id="main-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/home" className="m-0">
            Home
          </Nav.Link>
          {isAdmin && (
            <Nav.Link as={Link} to="/mailing-list">
              Mailing List
            </Nav.Link>
          )}
          <Nav.Link as={Link} to="/manage-inventory">
            Manage Inventory
          </Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link as={Link} to="/logout">
            <BoxArrowRight size="32px" />
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
