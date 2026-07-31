import React from 'react';
import Button from '../components/Button';

function NotFound() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Page not found</p>
      <Button onClick={() => window.history.back()}>Go Back</Button>
    </div>
  );
}

export default NotFound;
