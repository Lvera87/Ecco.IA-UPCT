import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import InfrastructureLayout from './InfrastructureLayout';

const Layout = ({ children }) => {
  const location = useLocation();
  const { pathname } = location;

  const infrastructureRoutes = [
    '/dashboard',
    '/financial-impact',
    '/appliances',
    '/energy-analysis',
    '/carbon-footprint',
    '/infrastructure-assistant',
    '/profile',
    '/energy-management',
  ];

  const isMatch = (routes) => {
    return routes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  };

  if (isMatch(infrastructureRoutes)) {
    return <InfrastructureLayout>{children}</InfrastructureLayout>;
  }

  // Default layout for pages without a sidebar/header
  return <>{children}</>;
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
