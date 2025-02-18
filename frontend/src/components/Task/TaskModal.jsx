import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api.config';
import { jwtDecode } from 'jwt-decode';
import { Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const TaskModal = ({ isOpen, onClose, onSave, task: editingTask, userId, handleClickOutside }) => {
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: userId || '',
    subtasks: []
  });

  useEffect(() => {
    if (editingTask) {
      setTaskData({
        ...editingTask,
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(taskData, !!editingTask);
      toast.success(`Task ${editingTask ? 'updated' : 'created'} successfully!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'slide-in-toast'
      });
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(`Failed to ${editingTask ? 'update' : 'create'} task: ${error.message || 'Unknown error'}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClickOutside}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
          <button
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <label>Title</label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
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
                value={taskData.priority === 'high' ? 2 : taskData.priority === 'medium' ? 1 : 0}
                onChange={(e) => {
                  const value = e.target.value;
                  const priority = value === '2' ? 'high' : value === '1' ? 'medium' : 'low';
                  setTaskData({ ...taskData, priority });
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
                  checked={taskData.status === 'todo'}
                  onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                />
                Todo
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="status"
                  value="backlog"
                  checked={taskData.status === 'backlog'}
                  onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                />
                Backlog
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={taskData.status === 'completed'}
                  onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                />
                Completed
              </label>
            </div>
          </div>

          <div className="form-section">
            <label>Description</label>
            <textarea
              value={taskData.description}
              onChange={(e) => {
                const words = e.target.value.trim().split(/\s+/).length;
                if (words <= 150) {
                  setTaskData({ ...taskData, description: e.target.value });
                }
              }}
              placeholder="Enter task description (max 150 words)"
              className="input-field textarea"
              rows="4"
              required
            />
            <span className="word-count">
              {taskData.description.trim().split(/\s+/).filter(word => word !== '').length} / 150 words
            </span>
          </div>

          <div className="form-section">
            <label>Due Date</label>
            <input
              type="date"
              value={taskData.dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="spinner" />
                  {editingTask ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                editingTask ? 'Save Changes' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;