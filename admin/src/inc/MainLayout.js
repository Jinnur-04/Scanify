// components/MainLayout.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Top from './Top';
import Footer from './Footer';
import ChatInterface from './ChatInterface';

function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false); // auto-close on mobile route change
    }
  }, [location.pathname]);

  return (
    <div id="wrapper" className="d-flex">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div id="content-wrapper" className="flex-grow-1 d-flex flex-column" style={{ marginLeft: isSidebarOpen && window.innerWidth >= 768 ? '250px' : '0' }}>
        <div id="content">
          <Top toggleSidebar={toggleSidebar} />
          <div className="container-fluid">{children}</div>
        </div>
        <Footer />
      </div>
      <ChatInterface/>
    </div>
  );
}


export default MainLayout;
