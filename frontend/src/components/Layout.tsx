import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    FiHome,
    FiTruck,
    FiPackage,
    FiMap,
    FiLogOut,
    FiMenu,
    FiX,
    FiUser
} from 'react-icons/fi';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Role-based navigation
    const getNavigation = () => {
        const baseNav = [{ name: 'Dashboard', href: '/', icon: FiHome }];

        if (user?.status_login === 'admin') {
            return [
                ...baseNav,
                { name: 'Kurir', href: '/kurir', icon: FiTruck },
                { name: 'Pengiriman', href: '/pengiriman', icon: FiPackage },
                { name: 'User Management', href: '/users', icon: FiUser },
                { name: 'Route Optimization', href: '/route', icon: FiMap },
            ];
        }

        if (user?.status_login === 'spv') {
            return [
                ...baseNav,
                { name: 'Route Optimization', href: '/route', icon: FiMap },
            ];
        }

        // Kurir only sees Dashboard
        return baseNav;
    };

    const navigation = getNavigation();

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <FiTruck className="w-8 h-8 text-primary-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">
                                Delivery Route
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-4">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.nama}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.status_login}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                            >
                                <FiLogOut className="w-5 h-5" />
                                <span className="ml-2 hidden md:inline">Logout</span>
                            </button>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                                {isMobileMenuOpen ? (
                                    <FiX className="w-6 h-6" />
                                ) : (
                                    <FiMenu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <nav className="px-4 py-4 space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
