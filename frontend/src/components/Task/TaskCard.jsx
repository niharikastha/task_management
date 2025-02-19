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
    const twoDaysFromNow = new Date(today.setDate(today.getDate() + 2));

    if (dueDate < today) return 'overdue';
    if (dueDate < twoDaysFromNow) return 'upcoming';
    return 'future';
  };

  const getCardBackgroundColor = () => {
    const priorityClasses = {
      high: 'task-card-high',
      medium: 'task-card-medium',
      low: 'task-card-low'
    };
    return priorityClasses[task.priority] || '';
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
    const content = sortBy === 'Priority' ? task.status : task.priority;
    const badgeType = sortBy === 'Priority' ? 'status' : 'priority';
    return (
      <span className={`priority-status ${getBadgeColor(badgeType)}`}>
        {content.charAt(0).toUpperCase() + content.slice(1)}
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