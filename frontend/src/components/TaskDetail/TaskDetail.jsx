import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Trash2, Save, AlertCircle, Calendar, Flag } from 'lucide-react';
import { toast } from 'react-toastify';
import API_CONFIG from '../../config/api.config';
import './taskDetail.css';

const TaskDetailPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const initialTask = location.state?.task || null;

    const [loading, setLoading] = useState(!initialTask);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [task, setTask] = useState(initialTask || null);
    const [editedTask, setEditedTask] = useState(initialTask || null);

    useEffect(() => {
        if (!initialTask) {
            fetchTaskDetails();
        }
    }, [taskId, initialTask]);

    const today = new Date().toISOString().split('T')[0];

    const fetchTaskDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}/${taskId}`, {
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch task details');
            }

            const data = await response.json();
            setTask(data);
            setEditedTask(data);
        } catch (error) {
            console.error('Failed to fetch task details:', error);
            toast.error('Failed to fetch task details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedTask(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedTask)
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            toast.success('Task updated successfully!');
            setLoading(true);

            setTimeout(() => {
                navigate('/tasks');
            }, 500);

        } catch (error) {
            console.error('Failed to update task:', error);
            toast.error('Failed to update task');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="task-detail-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (!editedTask) {
        return <div className="task-detail-container">Task not found</div>;
    }

    const getPriorityValue = (priority) => {
        switch (priority) {
            case 'low': return 1;
            case 'medium': return 2;
            case 'high': return 3;
            default: return 1;
        }
    };

    const getPriorityFromValue = (value) => {
        switch (parseInt(value)) {
            case 1: return 'low';
            case 2: return 'medium';
            case 3: return 'high';
            default: return 'low';
        }
    };

    const handleDeleteTask = async () => {
        setDeleting(true);
        try {
            const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            toast.success('Task deleted successfully!');
            navigate('/tasks');
        } catch (error) {
            console.error('Failed to delete task:', error);
            toast.error('Failed to delete task');
        } finally {
            setDeleting(false);
        }
    };


    return (
        <div className="task-detail-container">
            <div className="task-detail-header">
                <button className="back-button" onClick={() => navigate('/tasks')}>
                    <ChevronLeft size={18} />
                    Back to Tasks
                </button>

                <button className="delete-button" onClick={handleDeleteTask} disabled={deleting}>
                    <Trash2 size={18} />
                    {deleting ? 'Deleting...' : 'Delete Task'}
                </button>
            </div>

            <div className="task-detail-card">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        value={editedTask.title || ''}
                        onChange={handleInputChange}
                        placeholder="Task title"
                        className="task-title-input"
                    />

                    <div className="task-controls">
                        <div className="control-group">
                            <label className="control-label">Priority</label>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                value={getPriorityValue(editedTask.priority)}
                                onChange={(e) => handleInputChange({
                                    target: {
                                        name: 'priority',
                                        value: getPriorityFromValue(e.target.value)
                                    }
                                })}
                                className="priority-slider"
                            />
                            <div className="priority-indicator">
                                <div className={`priority-dot ${editedTask.priority}`}></div>
                                <span>{editedTask.priority?.charAt(0).toUpperCase() + editedTask.priority?.slice(1)}</span>
                            </div>
                        </div>

                        <div className="control-group">
                            <label className="control-label">Status</label>
                            <select
                                name="status"
                                value={editedTask.status || 'todo'}
                                onChange={handleInputChange}
                                className="status-select"
                            >
                                <option value="backlog">Backlog</option>
                                <option value="todo">Todo</option>
                                <option value="completed">Completed</option>
                            </select>
                            <div className={`status-badge ${editedTask.status}`}>
                                {editedTask.status?.charAt(0).toUpperCase() + editedTask.status?.slice(1)}
                            </div>
                        </div>

                        <div className="control-group">
                            <label className="control-label">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={editedTask.dueDate ? editedTask.dueDate.split('T')[0] : ''}
                                onChange={handleInputChange}
                                min={today} 
                                className="date-input"
                            />
                        </div>
                    </div>

                    <div className="task-description-section">
                        <label className="description-label">Description</label>
                        <textarea
                            name="description"
                            value={editedTask.description || ''}
                            onChange={handleInputChange}
                            placeholder="Add a detailed description of your task..."
                            className="task-description-textarea"
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="spinner-small" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TaskDetailPage;
