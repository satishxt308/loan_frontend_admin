import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setIsAuthenticated={setIsAuthenticated}
      />

      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />

        <main
          className={`flex-1 transition-all duration-300 pt-16 ${
            sidebarOpen ? "ml-64" : "ml-20"
          }`}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;