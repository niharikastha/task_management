import React from 'react';
import { Edit } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task, index, onEdit, sortBy }) => {
  const navigate = useNavigate();
  const draggableId = task._id;

  const truncateDescription = (text, wordCount = 10) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const getDueDateStatus = (dateString) => {
    if (!dateString) return '';

    const dueDate = new Date(dateString);
    const today = new Date();
    
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    if (dueDate < today) {
      return 'overdue';  
    } else if (dueDate <= tomorrow) {
      return 'upcoming';  
    }
    return 'future';  
  };

  const getCardBackgroundColor = () => {
    if (sortBy === 'Status') {
      const statusColors = {
        completed: 'task-card-low',
        todo: 'task-card-medium',
        backlog: 'task-card-high'
      };
      return statusColors[task.status] || '';
    } 
    else if (sortBy === 'Priority') {
      const priorityColors = {
        high: 'task-card-high',      
        medium: 'task-card-medium',   
        low: 'task-card-low'
      };
      return priorityColors[task.priority] || '';
    }
    else if (sortBy === 'Due Date') {
      const dueDateStatus = getDueDateStatus(task.dueDate);
      const dueDateColors = {
        overdue: 'task-card-high',     
        upcoming: 'task-card-medium', 
        future: 'task-card-low'       
      };
      return dueDateColors[dueDateStatus] || '';
    }
    return '';
  };

  const getBadgeColor = (type) => {
    const colors = {
      priority: {
        high: 'badge-red',
        medium: 'badge-yellow',
        low: 'badge-green'
      },
      status: {
        backlog: 'badge-blue',
        todo: 'badge-purple',
        completed: 'badge-green'
      }
    };
    return colors[type][task.priority || task.status] || 'badge-gray';
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.edit-button')) {
      onEdit(task); 
      return;
    }
    navigate(`/tasks/${task._id}`, { state: { task } });
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const renderMetadataBadge = () => {
    const label = sortBy === 'Priority' ? 'Status' : 'Priority';
    const value = sortBy === 'Priority' ? task.status : task.priority;
    const badgeType = sortBy === 'Priority' ? 'status' : 'priority';
    
    return (
      <span className={`priority-status ${getBadgeColor(badgeType)}`}>
        {`${label}: ${value.charAt(0).toUpperCase() + value.slice(1)}`}
      </span>
    );
  };
  return (
    <Draggable draggableId={draggableId} index={index} key={draggableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${getCardBackgroundColor()} ${snapshot.isDragging ? 'is-dragging' : ''}`}
          data-task-id={draggableId}
          onClick={handleCardClick}
        >
          <div className="task-header">
            <h3>{task.title}</h3>
            <button
              className="edit-button"
              onClick={handleEditClick}
            >
              <Edit size={16} />
            </button>
          </div>
          <div className="task-content">
            {task.description && (
              <p className="task-description">
                {truncateDescription(task.description)}
              </p>
            )}
          </div>
          <div className="task-details">
            {task.dueDate && (
              <div className={`task-due-date ${getDueDateStatus(task.dueDate)}`}>
                {formatDate(task.dueDate)}
              </div>
            )}
            {renderMetadataBadge()}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;