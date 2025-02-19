import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

const TaskColumns = ({ columns, tasks, onEditTask, sortBy }) => {
  return (
    <div className="task-columns">
      {columns.map((column) => (
        <Droppable key={column.id} droppableId={column.id}>
          {(provided) => (
            <div className="task-column" ref={provided.innerRef} {...provided.droppableProps}>
              <div className="column-header">
                <div className="priority-indicator">
                  <span className={`priority-dot ${column.id}`}></span>
                  <h2>{column.title}</h2>
                </div>
                <div className="task-count">
                  {tasks[column.id]?.length || 0} {tasks[column.id]?.length === 1 ? 'task' : 'tasks'}
                </div>
              </div>
              <div className="task-list">
                {tasks[column.id]?.map((task, index) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    index={index}
                    onEdit={() => onEditTask(task)}
                    sortBy={sortBy}
                  />
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
};

export default TaskColumns;
