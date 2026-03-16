import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BoxArrowRight } from 'react-bootstrap-icons';
import Logo from '../assets/Logo.svg';
import { useUser } from '../contexts/user';

export default function TopNavbar() {
  const { isAdmin, isAuthenticated } = useUser();

  if (!isAuthenticated) return null;

  return (
    <Navbar
      expand="lg"
      sticky="top"
      data-bs-theme="dark"
      className="top-navbar px-3 align-items-center"
    >
      <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center me-5">
        <img src={Logo} alt="MakerSpace" className="navbar-logo" />
        <span className="gold-text">ITAMS</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="main-nav" />
      <Navbar.Collapse id="main-nav">
        <Nav className="w-100 align-items-lg-center">
          <Nav.Link as={Link} to="/home" className="fw-bold nav-option">
            Home
          </Nav.Link>
          {isAdmin && (
            <Nav.Link as={Link} to="/mailing-list" className="fw-bold nav-option">
              Mailing List
            </Nav.Link>
          )}
          <Nav.Link as={Link} to="/manage-inventory" className="fw-bold nav-option">
            Manage Inventory
          </Nav.Link>
          <Nav.Link as={Link} to="/yolo" className="fw-bold nav-option">
            YOLO
          </Nav.Link>
          <hr className="d-lg-none my-2 border-2 w-25" style={{ color: 'var(--qu-gold)' }} />
          <Nav.Link as={Link} to="/logout" className="fw-bold ms-lg-auto logout-button">
            <BoxArrowRight size="40px" className="d-none d-lg-inline" />
            <span className="d-lg-none">Logout</span>
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
