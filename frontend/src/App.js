import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import TaskBoard from './components/Task/TaskBoard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/task" element={<TaskBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
