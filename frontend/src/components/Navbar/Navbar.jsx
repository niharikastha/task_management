import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

const Navbar = ({ username }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        navigate('/');
    };

    const firstName = username?.split(' ')[0];

    return (
        <nav className="navbar">
            <div className="nav-user-section">
                <button className="profile-button">
                    <User size={20} />
                    <span className="welcome-text">Hello, {firstName}</span>
                </button>
            </div>

            <button onClick={handleLogout} className="logout-button">
                <LogOut size={20} />
                Logout
            </button>
        </nav>
    );
};

export default Navbar;