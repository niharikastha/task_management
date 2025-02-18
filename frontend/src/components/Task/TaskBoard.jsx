import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, Loader } from 'lucide-react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_CONFIG from '../../config/api.config';
import './task.css';
import { jwtDecode } from 'jwt-decode';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import Navbar from '../Navbar/Navbar';
import { useLocation } from 'react-router-dom';

const TaskBoard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Priority');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [allTasks, setAllTasks] = useState([]); 
    const [organizedTasks, setOrganizedTasks] = useState({
        high: [],
        medium: [],
        low: [],
        todo: [],
        backlog: [],
        completed: []
    });
    const [loading, setLoading] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const token = localStorage.getItem("auth_token");

    let userId = "";
    const location = useLocation();
    const username = location.state?.name || 'User';

    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            userId = decodedToken.userId;
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

    const sortTasksByDueDate = (tasksToSort) => {
        return [...tasksToSort].sort((a, b) => {
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    };

    const organizeTasks = () => {
        let filteredTasks = allTasks;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredTasks = allTasks.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
            );
        }

        let organized;
        if (sortBy === 'Priority') {
            organized = {
                high: filteredTasks.filter(task => task.priority === 'high'),
                medium: filteredTasks.filter(task => task.priority === 'medium'),
                low: filteredTasks.filter(task => task.priority === 'low')
            };
        } else {
            organized = {
                todo: filteredTasks.filter(task => task.status === 'todo'),
                backlog: filteredTasks.filter(task => task.status === 'backlog'),
                completed: filteredTasks.filter(task => task.status === 'completed')
            };

            if (sortBy === 'Due Date') {
                Object.keys(organized).forEach(status => {
                    organized[status] = sortTasksByDueDate(organized[status]);
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
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            const tasks = Array.isArray(data) ? data : (data?.tasks || data?.data || []);
            setAllTasks(tasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error(`Failed to fetch tasks: ${error.message || 'Unknown error'}`, {
                position: "top-right",
                autoClose: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData, isEditing) => {
        try {
            const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
            const url = isEditing
                ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}/${taskData._id}`
                : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}`;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...taskData,
                    assignedTo: userId
                })
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${await response.text()}`);
            }

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
            console.error('Failed to save task:', error);
            throw error;
        }
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
                                sortBy={sortBy}
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

                <div className="taskboard-header">
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="header-actions">
                        <div className="sort-dropdown">
                            <button
                                className="sort-button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                Sort by : <b>{sortBy}</b>
                                <ChevronDown size={16} />
                            </button>
                            {isDropdownOpen && (
                                <div className="sort-menu">
                                    <button onClick={() => {
                                        setSortBy('Priority');
                                        setIsDropdownOpen(false);
                                    }}>
                                        Priority
                                    </button>
                                    <button onClick={() => {
                                        setSortBy('Due Date');
                                        setIsDropdownOpen(false);
                                    }}>
                                        Due Date
                                    </button>
                                    <button onClick={() => {
                                        setSortBy('Status');
                                        setIsDropdownOpen(false);
                                    }}>
                                        Status
                                    </button>
                                </div>
                            )}
                        </div>
                        <button className="create-task-button" onClick={() => setIsModalOpen(true)}>
                            <Plus size={20} />
                            Create a new task
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <Loader size={36} className="spinner" />
                        <p>Loading tasks...</p>
                    </div>
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