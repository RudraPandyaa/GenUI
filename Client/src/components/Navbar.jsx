import React, { useState, useEffect } from 'react';
import { HiSun, HiMoon } from 'react-icons/hi';
import { RiSettings3Fill } from 'react-icons/ri';
import { useTheme } from './ThemeContext';
import { Link } from 'react-router-dom';
import SettingsModal from './SettingsModal';
import { authService } from "../services/auth";
import { FaUser } from 'react-icons/fa';
import { FiEdit2, FiLogOut } from "react-icons/fi";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser || savedUser === "undefined" || savedUser === "null") {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch {
      // corrupted JSON fix
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const getInitials = (username) => {
    if (!username) return "U";
    return username.trim()[0].toUpperCase();
  };


  return (
    <>
      <div className='nav flex items-center justify-between px-6 md:px-[100px] h-[90px] 
        border-b-[1px] border-[#1f2937] dark:border-gray-800 
        bg-white dark:bg-[#141319] transition-colors duration-300 sticky top-0 z-50'>

        {/* Logo */}
        <Link to="/" className="logo cursor-pointer">
          <h3 className="text-[25px] font-bold text-white bg-gradient-to-r 
            from-purple-500 to-indigo-600 px-5 py-2 rounded-lg inline-block shadow-lg">
            GenUI
          </h3>
        </Link>

        {/* Right Icons */}
        <div className="icons flex items-center gap-[15px] text-black dark:text-white">

          {/* Theme Toggle */}
          <div
            className="icon cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <HiSun size={20} /> : <HiMoon size={20} />}
          </div>

          {/* Settings */}
          <div
            className="icon cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            <RiSettings3Fill size={20} />
          </div>

          {/* Avatar / Login */}
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="icon cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
            >
              <span className="font-semibold"><FaUser size={18} /></span>
            </Link>
          ) : (
            <div className="relative">
              <div
  onClick={() => setDropdownOpen(!dropdownOpen)}
  className="
    w-14 h-14
    cursor-pointer
    hover:bg-gray-200 dark:hover:bg-gray-800
    transition
    border-2 border-[#1f2937]
    rounded-[10px]
    overflow-hidden
  "
>
  {user?.profilePic ? (
    // Image avatar: full edge-to-edge, no gap, matches container shape exactly
    <div className="w-full h-full">
      <img
        src={user.profilePic}
        alt="Profile"
        className="w-full h-full object-cover rounded-[8px]"
      />
    </div>
  ) : (
    // Initials avatar: intentional inner spacing via smaller centered element
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-9 h-9 flex items-center justify-center rounded-[7px]">
        <span className="font-bold text-white text-lg leading-none">
          {getInitials(user?.username)}
        </span>
      </div>
    </div>
  )}
</div>



                  {dropdownOpen && (
                    <div
                      className="
                        absolute right-0 mt-3 w-48
                        bg-[#09090B] text-white
                        rounded-xl shadow-lg
                        border border-gray-800
                        py-2 z-50
                      "
                    >
                      {/* Edit Profile */}
                      <Link
                        to="/edit-profile"
                        onClick={() => setDropdownOpen(false)}
                        className="
                          flex items-center gap-3
                          px-4 py-2
                          text-sm
                          hover:bg-gray-800
                          transition
                        "
                      >
                        <FiEdit2 size={16} className="text-purple-400" />
                        <span>Edit Profile</span>
                      </Link>

                      {/* Divider */}
                      <div className="my-1 border-t border-gray-800" />

                      {/* Logout */}
                      <button
                        onClick={authService.logout}
                        className="
                          w-full flex items-center gap-3
                          px-4 py-2
                          text-sm text-left
                          text-red-400
                          hover:bg-gray-800
                          transition
                        "
                      >
                        <FiLogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}


              </div>
          )}

        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Navbar;