import React, { useState, useEffect } from 'react';
import { Plus, Edit, Search, ChevronDown } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API_CONFIG from '../../config/api.config';
import './task.css';
import { jwtDecode } from 'jwt-decode';

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
  const [editingTask, setEditingTask] = useState(null);
  const token = localStorage.getItem("auth_token");

  let userId = "";
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
    console.log("Updated tasks:", tasks);
  }, [tasks]);

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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newTasks = { ...tasks };

    const draggedTask = newTasks[source.droppableId].splice(source.index, 1)[0];
    newTasks[destination.droppableId].splice(destination.index, 0, draggedTask);

    setTasks(newTasks);
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
    // Ensure tasksData is an array
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
    try {
      const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}`, {
        headers: {
          'Authorization': `${token}`
        }
      });

      const data = await response.json();
      console.log("Raw data type:", typeof data, "Data:", data); 
      const organizedTasks = organizeTasks(data);
      console.log("Organized tasks:", organizedTasks);
      setTasks(organizedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const TaskCard = ({ task, index }) => (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="task-card"
        >
          <div className="task-header">
            <h3>{task.title}</h3>
            <button
              className="edit-button"
              onClick={() => {
                setEditingTask(task);
                setIsModalOpen(true);
              }}
            >
              <Edit size={16} />
            </button>
          </div>
          <div className="task-details">
            {task.subtasks && (
              <div className="subtasks-progress">
                <span>{task.subtasks.filter(st => st.completed).length} of {task.subtasks.length} tasks</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );

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
              <TaskCard key={task._id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );

  return (
    <div className="taskboard-container">
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="task-columns">
          {getColumnsBySort().map(column => (
            <TaskColumn
              key={column.id}
              title={column.title}
              tasks={tasks[column.id] || []}
              columnId={column.id}
            />
          ))}
        </div>
      </DragDropContext>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleClickOutside}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button
                className="close-button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTask(null);
                }}
              >
                ×
              </button>
            </div>

            <form className="task-form" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const taskData = editingTask ? editingTask : newTask;
                const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);

                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}`, {
                  method: editingTask ? 'PUT' : 'POST',
                  headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    ...taskData,
                    assignedTo: userId
                  })
                });

                if (response.ok) {
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
                  // Fetch updated tasks
                  fetchTasks();
                }
              } catch (error) {
                console.error('Failed to save task:', error);
              }
            }}>
              <div className="form-section">
                <label>Title</label>
                <input
                  type="text"
                  value={editingTask ? editingTask.title : newTask.title}
                  onChange={(e) => editingTask
                    ? setEditingTask({ ...editingTask, title: e.target.value })
                    : setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-section">
                <label>Priority</label>
                <div className="priority-slider">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    value={editingTask
                      ? (editingTask.priority === 'high' ? 2 : editingTask.priority === 'medium' ? 1 : 0)
                      : (newTask.priority === 'high' ? 2 : newTask.priority === 'medium' ? 1 : 0)
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const priority = value === '2' ? 'high' : value === '1' ? 'medium' : 'low';
                      editingTask
                        ? setEditingTask({ ...editingTask, priority })
                        : setNewTask({ ...newTask, priority });
                    }}
                    className="priority-range"
                  />
                  <div className="priority-labels">
                    <span className="low">Low</span>
                    <span className="medium">Medium</span>
                    <span className="high">High</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <label>Status</label>
                <div className="status-radio">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="todo"
                      checked={(editingTask ? editingTask.status : newTask.status) === 'todo'}
                      onChange={(e) => editingTask
                        ? setEditingTask({ ...editingTask, status: e.target.value })
                        : setNewTask({ ...newTask, status: e.target.value })
                      }
                    />
                    Todo
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="backlog"
                      checked={(editingTask ? editingTask.status : newTask.status) === 'backlog'}
                      onChange={(e) => editingTask
                        ? setEditingTask({ ...editingTask, status: e.target.value })
                        : setNewTask({ ...newTask, status: e.target.value })
                      }
                    />
                    Backlog
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="completed"
                      checked={(editingTask ? editingTask.status : newTask.status) === 'completed'}
                      onChange={(e) => editingTask
                        ? setEditingTask({ ...editingTask, status: e.target.value })
                        : setNewTask({ ...newTask, status: e.target.value })
                      }
                    />
                    Completed
                  </label>
                </div>
              </div>

              <div className="form-section">
                <label>Description</label>
                <textarea
                  value={editingTask ? editingTask.description : newTask.description}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/).length;
                    if (words <= 150) {
                      editingTask
                        ? setEditingTask({ ...editingTask, description: e.target.value })
                        : setNewTask({ ...newTask, description: e.target.value });
                    }
                  }}
                  placeholder="Enter task description (max 150 words)"
                  className="input-field textarea"
                  rows="4"
                  required
                />
                <span className="word-count">
                  {(editingTask ? editingTask.description : newTask.description)
                    .trim().split(/\s+/).filter(word => word !== '').length} / 150 words
                </span>
              </div>

              <div className="form-section">
                <label>Due Date</label>
                <input
                  type="date"
                  value={editingTask ? editingTask.dueDate : newTask.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => editingTask
                    ? setEditingTask({ ...editingTask, dueDate: e.target.value })
                    : setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="primary">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;