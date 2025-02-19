import React, { useRef, useEffect } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';

const SearchAndFilter = ({ 
  searchQuery, 
  onSearch, 
  sortBy, 
  isDropdownOpen, 
  setIsDropdownOpen,
  setSortBy,
  onCreateTask 
}) => {
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  }, [setIsDropdownOpen]);

  return (
    <div className="taskboard-header">
      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search anything..."
          value={searchQuery}
          onChange={onSearch}
        />
      </div>
      <div className="header-actions">
        <div className="sort-dropdown" ref={dropdownRef}>
          <button
            className="sort-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Sort by: <b>{sortBy}</b>
            <ChevronDown size={16} />
          </button>
          {isDropdownOpen && (
            <div className="sort-menu">
              <button onClick={() => {
                setSortBy('Priority');
                setIsDropdownOpen(false);
              }}>Priority</button>
              <button onClick={() => {
                setSortBy('Due Date');
                setIsDropdownOpen(false);
              }}>Due Date</button>
              <button onClick={() => {
                setSortBy('Status');
                setIsDropdownOpen(false);
              }}>Status</button>
            </div>
          )}
        </div>
        <button className="create-task-button" onClick={onCreateTask}>
          <Plus size={20} />
          Create a new task
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilter;
