import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="layout-body">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`main-content ${sidebarOpen ? "" : "main-expanded"}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
