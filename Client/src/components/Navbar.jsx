import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { HiSun, HiMoon } from 'react-icons/hi';
import { RiSettings3Fill } from 'react-icons/ri';
import { useTheme } from './ThemeContext';
import { Link } from 'react-router-dom';
import { GrLogout } from "react-icons/gr";
import { authService } from "../services/auth";
import SettingsModal from './SettingsModal';
const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");
  // const handleLogout = () => {
  // localStorage.removeItem("token");
  //   navigate("/login");
  // };

  return (
    <>
          <div className='nav flex items-center justify-between px-6 md:px-[100px] h-[90px] border-b-[1px] border-[#1f2937] dark:border-gray-800 bg-white dark:bg-[#141319] transition-colors duration-300 sticky top-0 z-50'>
      <Link to="/" className="logo cursor-pointer">
        <h3 className="text-[25px] font-bold text-white bg-gradient-to-r 
      from-purple-500 to-indigo-600 px-5 py-2 rounded-lg inline-block shadow-lg">
        GenUI
      </h3>



      </Link>
      
      <div className="icons flex items-center gap-[15px] text-black dark:text-white">

        <div
          className="icon cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <HiSun size={20} /> : <HiMoon size={20} />}
        </div>

        <div className="icon cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
        >
          <RiSettings3Fill size={20} />
        </div>

        {!isLoggedIn ? (
        <Link
          to="/login"
          className="icon cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
        >
          <FaUser size={18} />
        </Link>
      ) : (
        <button
          onClick={authService.logout}
          className="icon cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
          title="Logout"
        >
          <GrLogout size={18} />
        </button>
      )}

      </div>
    </div>
    <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Navbar;