import React from 'react';
import './App.css';

const NotFound = () => (
  <section className="notfound-section">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>Sorry, the page you are looking for does not exist or has been moved.</p>
    <a className="notfound-home-link" href="/">Go to Home</a>
  </section>
);

export default NotFound;
