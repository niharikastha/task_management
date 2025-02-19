import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';
import API_CONFIG from '../../config/api.config';
import TaskCard from './TaskCard';
import SearchAndFilter from './SearchAndFilter';
import Loading from './Loading';
import TaskModal from './TaskModal';
import Navbar from '../Navbar/Navbar';
import 'react-toastify/dist/ReactToastify.css';
import './task.css';

const TaskBoard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Priority');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allTasks, setAllTasks] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [organizedTasks, setOrganizedTasks] = useState({
    high: [], 
    medium: [], 
    low: [],
    todo: [], 
    backlog: [], 
    completed: []
  });

  const token = localStorage.getItem("auth_token");
  const location = useLocation();
  const username = location.state?.name || 'User';
  let userId = "";

  if (token) {
    try {
      userId = jwtDecode(token).userId;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: userId || '',
    subtasks: []
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    organizeTasks();
  }, [sortBy, allTasks, searchQuery]); 

  const sortByDueDate = (tasks) => {
    return [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const organizeTasks = () => {
    let filtered = searchQuery.trim() 
      ? allTasks.filter(task => 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allTasks;

    let organized = {};
    if (sortBy === 'Priority') {
      organized = {
        high: filtered.filter(task => task.priority === 'high'),
        medium: filtered.filter(task => task.priority === 'medium'),
        low: filtered.filter(task => task.priority === 'low')
      };
    } else {
      organized = {
        todo: filtered.filter(task => task.status === 'todo'),
        backlog: filtered.filter(task => task.status === 'backlog'),
        completed: filtered.filter(task => task.status === 'completed')
      };

      if (sortBy === 'Due Date') {
        Object.keys(organized).forEach(status => {
          organized[status] = sortByDueDate(organized[status]);
        });
      }
    }

    setOrganizedTasks(organized);
  };

  const getColumnsBySort = () => {
    switch (sortBy) {
      case 'Priority':
        return [
          { id: 'high', title: 'High' },
          { id: 'medium', title: 'Medium' },
          { id: 'low', title: 'Low' }
        ];
      case 'Due Date':
      case 'Status':
        return [
          { id: 'backlog', title: 'Backlog' },
          { id: 'todo', title: 'Todo' },
          { id: 'completed', title: 'Completed' }
        ];
      default:
        return [];
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedTasks = [...allTasks];
    const sourceList = organizedTasks[source.droppableId];
    const draggedTask = sourceList[source.index];

    const updatedTask = { ...draggedTask };
    if (sortBy === 'Status' || sortBy === 'Due Date') {
      updatedTask.status = destination.droppableId;
    } else if (sortBy === 'Priority') {
      updatedTask.priority = destination.droppableId;
    }

    const taskIndex = updatedTasks.findIndex(t => t._id === draggedTask._id);
    updatedTasks[taskIndex] = updatedTask;
    setAllTasks(updatedTasks);

    try {
      const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}/${draggedTask._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      toast.success('Task updated successfully!', {
        position: "top-right",
        autoClose: 1000,
        className: 'slide-in-toast'
      });
    } catch (error) {
      console.error('Failed to update task after drag:', error);

      updatedTasks[taskIndex] = draggedTask;
      setAllTasks(updatedTasks);

      toast.error(`Failed to update task`, {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}/user/${userId}`, {
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      setAllTasks(Array.isArray(data) ? data : (data?.tasks || data?.data || []));
    } catch (error) {
      console.error('Fetch failed:', error);
      toast.error(`Failed to fetch tasks: ${error.message || 'Unknown error'}`, {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };



  const handleSaveTask = async (taskData, isEditing) => {
    try {
      const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}${isEditing ? `/${taskData._id}` : ''}`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...taskData, assignedTo: userId })
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const savedTask = await response.json();

      if (isEditing) {
        setAllTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === savedTask._id ? savedTask : task
          )
        );
      } else {
        setAllTasks(prevTasks => [...prevTasks, savedTask]);
      }

      setIsModalOpen(false);
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignedTo: userId,
        subtasks: []
      });

      return true;
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };


  const TaskColumn = ({ title, tasks, columnId }) => (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          className="task-column"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className="column-header">
            <div className="priority-indicator">
              <span className={`priority-dot ${columnId}`}></span>
              <h2>{title}</h2>
            </div>
            <div className="task-count">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>
          <div className="task-list">
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onEdit={() => handleEditTask(task)}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );

  return (
    <div>
      <Navbar username={username} />
      <div className="taskboard-container">
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <SearchAndFilter 
          searchQuery={searchQuery}
          onSearch={(e) => setSearchQuery(e.target.value)}
          sortBy={sortBy}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          setSortBy={setSortBy}
          onCreateTask={() => setIsModalOpen(true)}
        />

        {loading ? (
          <Loading />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="task-columns">
              {getColumnsBySort().map(column => (
                <TaskColumn
                  key={column.id}
                  title={column.title}
                  tasks={organizedTasks[column.id] || []}
                  columnId={column.id}
                />
              ))}
            </div>
          </DragDropContext>
        )}

        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(null);
            }}
            onSave={handleSaveTask}
            task={editingTask}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
};

export default TaskBoard;