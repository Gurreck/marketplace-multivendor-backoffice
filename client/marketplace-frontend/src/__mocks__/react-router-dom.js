module.exports = {
  BrowserRouter: function BrowserRouter({ children }) { return children; },
  Routes: function Routes({ children }) { return children; },
  Route: function Route() { return null; },
  Navigate: function Navigate() { return null; },
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '' }),
  useParams: () => ({}),
  Link: function Link({ children }) { return children; },
  NavLink: function NavLink({ children }) { return children; },
};