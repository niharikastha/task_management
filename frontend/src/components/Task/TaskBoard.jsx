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
    const [tasks, setTasks] = useState({
        high: [],
        medium: [],
        low: [],
        todo: [],
        backlog: [],
        completed: []
    });
    const [loading, setLoading] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filteredTasks, setFilteredTasks] = useState({});
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
    }, [sortBy]);

    useEffect(() => {
        filterTasks();
    }, [searchQuery, tasks]);

    const filterTasks = () => {
        if (!searchQuery.trim()) {
            setFilteredTasks(tasks);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered = {};

        Object.keys(tasks).forEach(key => {
            filtered[key] = tasks[key].filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
            );
        });

        setFilteredTasks(filtered);
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
        const newTasks = { ...tasks };

        const draggedTask = newTasks[source.droppableId].splice(source.index, 1)[0];
        newTasks[destination.droppableId].splice(destination.index, 0, draggedTask);

        const originalTask = { ...draggedTask };

        if (sortBy === 'Status' || sortBy === 'Due Date') {
            draggedTask.status = destination.droppableId;
        } else if (sortBy === 'Priority') {
            draggedTask.priority = destination.droppableId;
        }

        setTasks(newTasks);

        try {
            const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}/${draggedTask._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(draggedTask)
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
            
            const revertedTasks = { ...newTasks };
            revertedTasks[destination.droppableId] = revertedTasks[destination.droppableId].filter(
                t => t._id !== originalTask._id
            );
            revertedTasks[source.droppableId].splice(source.index, 0, originalTask);
            
            setTasks(revertedTasks);
            
            toast.error(`Failed to update task: ${error.message || 'Unknown error'}`, {
                position: "top-right",
                autoClose: 2000,
            });
        }
    };

    const handleClickOutside = (e) => {
        if (e.target.className === 'modal-overlay') {
            setIsModalOpen(false);
            setEditingTask(null);
        }
    };

    const sortTasksByDueDate = (tasksToSort) => {
        return [...tasksToSort].sort((a, b) => {
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    };

    const organizeTasks = (tasksData) => {
        const tasks = Array.isArray(tasksData) ? tasksData :
            (tasksData?.tasks || tasksData?.data || []);

        if (sortBy === 'Priority') {
            return {
                high: tasks.filter(task => task.priority === 'high'),
                medium: tasks.filter(task => task.priority === 'medium'),
                low: tasks.filter(task => task.priority === 'low')
            };
        } else {
            const organized = {
                todo: tasks.filter(task => task.status === 'todo'),
                backlog: tasks.filter(task => task.status === 'backlog'),
                completed: tasks.filter(task => task.status === 'completed')
            };

            if (sortBy === 'Due Date') {
                Object.keys(organized).forEach(status => {
                    organized[status] = sortTasksByDueDate(organized[status]);
                });
            }

            return organized;
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}`, {
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            const organizedTasks = organizeTasks(data);
            setTasks(organizedTasks);
            setFilteredTasks(organizedTasks);
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
            await fetchTasks();
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
                                    tasks={(searchQuery ? filteredTasks : tasks)[column.id] || []}
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
                        handleClickOutside={handleClickOutside}
                    />
                )}
            </div>
        </div>
    );
};

export default TaskBoard;