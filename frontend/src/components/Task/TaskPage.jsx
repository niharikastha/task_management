import React, { useState, useEffect } from 'react';
import { Plus, Edit, Search, ChevronDown } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API_CONFIG from '../../config/api.config';
import './task.css';

const TaskBoard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Priority'); 
  const [tasks, setTasks] = useState({
    high: [],
    medium: [],
    low: []
  });
  const [editingTask, setEditingTask] = useState(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo',
    subtasks: []
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
  
    const { source, destination } = result;
    const newTasks = { ...tasks };
    
    const draggedTask = newTasks[source.droppableId].splice(source.index, 1)[0];
    
    newTasks[destination.droppableId].splice(destination.index, 0, draggedTask);
    
    setTasks(newTasks);
  };

  const sortTasks = (tasksToSort) => {
    return tasksToSort.sort((a, b) => {
      if (sortBy === 'dueDate') {
        // First sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by due date
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      } else {
        // Default priority sorting
        const priorityOrder = { high: 0,medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
    });
  };

  const organizeTasks = (tasksData) => {
    const organized = {
      high: [],
      medium: [],
      low: []
    };

    tasksData.forEach(task => {
      organized[task.priority].push(task);
    });

    // Sort each priority group
    Object.keys(organized).forEach(priority => {
      organized[priority] = sortTasks(organized[priority]);
    });

    return organized;
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
      setTasks(organizeTasks(data));
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

  const TaskColumn = ({ title, tasks, priorityLevel }) => (
    <Droppable droppableId={priorityLevel}>
      {(provided) => (
        <div 
          className="task-column"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className="column-header">
            <div className="priority-indicator">
              <span className={`priority-dot ${priorityLevel}`}></span>
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
            <button className="sort-button">
              Sort by : <b>{sortBy}</b>
              <ChevronDown size={16} />
            </button>
            <div className="sort-menu">
              <button onClick={() => setSortBy('priority')}>Priority</button>
              <button onClick={() => setSortBy('dueDate')}>Due Date</button>
              <button onClick={() => setSortBy('status')}>Status</button>
            </div>
          </div>
          <button className="create-task-button" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Create a new task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="task-columns">
          <TaskColumn 
            title="High" 
            tasks={tasks.high}
            priorityLevel="high"
          />
          <TaskColumn 
            title="Medium" 
            tasks={tasks.medium}
            priorityLevel="medium"
          />
          <TaskColumn 
            title="Low" 
            tasks={tasks.low}
            priorityLevel="low"
          />
        </div>
      </DragDropContext>

      {/* Task Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form className="task-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingTask ? editingTask.title : newTask.title}
                  onChange={(e) => editingTask 
                    ? setEditingTask({...editingTask, title: e.target.value})
                    : setNewTask({...newTask, title: e.target.value})
                  }
                  placeholder="Enter task title"
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={editingTask ? editingTask.priority : newTask.priority}
                  onChange={(e) => editingTask
                    ? setEditingTask({...editingTask, priority: e.target.value})
                    : setNewTask({...newTask, priority: e.target.value})
                  }
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={editingTask ? editingTask.dueDate : newTask.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => editingTask
                    ? setEditingTask({...editingTask, dueDate: e.target.value})
                    : setNewTask({...newTask, dueDate: e.target.value})
                  }
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => {
                  setIsModalOpen(false);
                  setEditingTask(null);
                }}>
                  Cancel
                </button>
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