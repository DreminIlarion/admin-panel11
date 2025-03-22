import React from 'react';
import { FaHome, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import './Sidebar.css';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to="/" className="sidebar-link">
            <FaHome className="icon"/>
            <span className="tooltip">Главная</span>
          </Link>
        </li>
        <li>
          <Link to="/users" className="sidebar-link">
            <FaUsers className="icon"/>
            <span className="tooltip">Пользователи</span>
          </Link>
        </li>
        <li>
          <Link to="/events" className="sidebar-link">
            <FaCalendarAlt className="icon"/>
            <span className="tooltip">Мероприятия</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;

