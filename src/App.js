import './App.css';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard'; 
import UsersTab from './components/UsersTab';
import Events from "./components/Events";
import News from "./components/News"; // Убедитесь, что импорт правильный
import NotFound from "./components/NotFound";
import { Route, Routes } from 'react-router-dom';
import './index.css';
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isNotFound = !["/", "/users", "/events", "/news"].includes(location.pathname);

  return (
    <div className="App">
      {!isNotFound && <Sidebar />} 
      <div className="main-content">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UsersTab />} />
          <Route path="/events" element={<Events />} />
          <Route path="/news" element={<News />} /> {/* Исправлено здесь */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;