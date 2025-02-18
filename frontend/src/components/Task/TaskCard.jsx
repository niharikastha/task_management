import React from 'react';
import { Edit } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';
import { format, isBefore, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task, index, onEdit }) => {
  const navigate = useNavigate();
  const draggableId = task._id || `task-${index}-${Date.now()}`;
  
  const truncateDescription = (text, wordCount = 10) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date format:', dateString);
      return 'Invalid date';
    }
    return format(parsedDate, 'MMM dd, yyyy');
  };
  

  const getDueDateStatus = (dateString) => {
    if (!dateString) return '';
    
    const dueDate = new Date(dateString);
    const today = new Date();
    const inTwoDays = addDays(today, 2);
    
    if (isBefore(dueDate, today)) {
      return 'overdue';
    } else if (isBefore(dueDate, inTwoDays)) {
      return 'upcoming';
    } else {
      return 'future';
    }
  };

  const dueDateStatus = getDueDateStatus(task.dueDate);
  
  const getCardBackgroundColor = () => {
    switch (task.priority) {
      case 'high':
        return 'task-card-high';
      case 'medium':
        return 'task-card-medium';
      case 'low':
        return 'task-card-low';
      default:
        return '';
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.edit-button')) {
      onEdit(task); 
      return;
    }
    navigate(`/tasks/${task._id}`, { state: { task } });
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
              onClick={onEdit}
            >
              <Edit size={16} />
            </button>
          </div>
          <div className="task-content">
            {task.description && (
              <p className="task-description">{truncateDescription(task.description)}</p>
            )}
          </div>
          <div className="task-details">
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="subtasks-progress">
                <span>{task.subtasks.filter(st => st.completed).length} of {task.subtasks.length} tasks</span>
              </div>
            )}
            {task.dueDate && (
              <div className={`task-due-date ${dueDateStatus}`}>
                {formatDate(task.dueDate)}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;