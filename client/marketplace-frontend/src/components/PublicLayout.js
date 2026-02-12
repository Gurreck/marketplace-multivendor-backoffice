import Navbar from "./Navbar";

const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-main-content">{children}</main>
    </div>
  );
};

export default PublicLayout;
