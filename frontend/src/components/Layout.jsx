import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, ListOrdered, LogOut, Moon, Sun, TrendingUp, Users, Settings } from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10 w-full transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">P&L Tracker</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                                {user?.role === 'admin' ? (
                                    <>
                                        <NavLink
                                            to="/admin/dashboard"
                                            className={({ isActive }) =>
                                                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                                    ? 'border-blue-500 text-gray-900 dark:text-white'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`
                                            }
                                        >
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            Overview
                                        </NavLink>
                                        <NavLink
                                            to="/admin/users"
                                            className={({ isActive }) =>
                                                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                                    ? 'border-blue-500 text-gray-900 dark:text-white'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`
                                            }
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Users
                                        </NavLink>
                                        <NavLink
                                            to="/settings"
                                            className={({ isActive }) =>
                                                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                                    ? 'border-blue-500 text-gray-900 dark:text-white'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`
                                            }
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </NavLink>
                                    </>
                                ) : (
                                    <>
                                        <NavLink
                                            to="/dashboard"
                                            className={({ isActive }) =>
                                                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                                    ? 'border-blue-500 text-gray-900 dark:text-white'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`
                                            }
                                        >
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </NavLink>
                                        <NavLink
                                            to="/trades"
                                            className={({ isActive }) =>
                                                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                                    ? 'border-blue-500 text-gray-900 dark:text-white'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`
                                            }
                                        >
                                            <ListOrdered className="w-4 h-4 mr-2" />
                                            Trades
                                        </NavLink>
                                        <NavLink
                                            to="/settings"
                                            className={({ isActive }) =>
                                                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                                    ? 'border-blue-500 text-gray-900 dark:text-white'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`
                                            }
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
                            >
                                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                            <div className="flex items-center gap-3">
                                {user?.profilePic ? (
                                    <img
                                        src={user.profilePic}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <span className="text-sm font-medium">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                )}
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
                                    {user?.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm transition-colors"
                                >
                                    <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile nav indicator bar */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-10 w-full transition-colors duration-200">
                {user?.role === 'admin' ? (
                    <>
                        <NavLink
                            to="/admin/dashboard"
                            className={({ isActive }) =>
                                `flex flex-col items-center p-2 rounded-md ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'
                                }`
                            }
                        >
                            <LayoutDashboard className="w-6 h-6" />
                            <span className="text-xs font-medium mt-1">Dash</span>
                        </NavLink>
                        <NavLink
                            to="/admin/users"
                            className={({ isActive }) =>
                                `flex flex-col items-center p-2 rounded-md ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'
                                }`
                            }
                        >
                            <Users className="w-6 h-6" />
                            <span className="text-xs font-medium mt-1">Users</span>
                        </NavLink>
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `flex flex-col items-center p-2 rounded-md ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'
                                }`
                            }
                        >
                            <Settings className="w-6 h-6" />
                            <span className="text-xs font-medium mt-1">Settings</span>
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `flex flex-col items-center p-2 rounded-md ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'
                                }`
                            }
                        >
                            <LayoutDashboard className="w-6 h-6" />
                            <span className="text-xs font-medium mt-1">Dash</span>
                        </NavLink>
                        <NavLink
                            to="/trades"
                            className={({ isActive }) =>
                                `flex flex-col items-center p-2 rounded-md ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'
                                }`
                            }
                        >
                            <ListOrdered className="w-6 h-6" />
                            <span className="text-xs font-medium mt-1">Trades</span>
                        </NavLink>
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `flex flex-col items-center p-2 rounded-md ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'
                                }`
                            }
                        >
                            <Settings className="w-6 h-6" />
                            <span className="text-xs font-medium mt-1">Settings</span>
                        </NavLink>
                    </>
                )}
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16 sm:mb-0 transition-colors duration-200">
                {children}
            </main>
        </div>
    );
};

export default Layout;
