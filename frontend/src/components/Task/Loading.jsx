import React from 'react';
import { Loader } from 'lucide-react';
import './task.css';

const Loading = () => (
  <div className="loading-container">
    <Loader size={36} className="spinner" />
  </div>
);

export default Loading;