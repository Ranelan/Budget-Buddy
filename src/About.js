import React from 'react';
import './App.css';
import Testimonials from './Testimonials';

const About = () => (
  <div className="about-page">
    {/* Our Story Header Section */}
    <section className="about-hero">
      <h1 className="about-title">About Budget Buddy</h1>
      <p className="about-subtitle">
        Budget Buddy was born from a simple observation: managing personal finances shouldn't be complicated, 
        stressful, or overwhelming. Too many people struggle with budgeting, expense tracking, and financial 
        planning because existing tools are either too complex or lack the features needed for real-world 
        financial management.
      </p>
      <p className="about-description">
        We set out to create a platform that combines powerful functionality with intuitive design, 
        making it easy for anyone to understand their spending patterns, set meaningful financial goals, 
        and build a secure financial future. Whether you're just starting your financial journey or 
        looking to optimize years of financial planning, Budget Buddy provides the tools and insights 
        you need to succeed.
      </p>
    </section>

    

    {/* Values Section */}
    <section className="values-section">
      <h2>Our Core Values</h2>
      <div className="values-grid">
        <div className="value-item">
          <h4>Transparency</h4>
          <p>We believe in clear, honest communication about how your data is used and protected.</p>
        </div>
        <div className="value-item">
          <h4>Accessibility</h4>
          <p>Financial tools should be available to everyone, regardless of their technical expertise or income level.</p>
        </div>
        <div className="value-item">
          <h4>Privacy</h4>
          <p>Your financial information is yours. We never sell your data or share it without your explicit consent.</p>
        </div>
      </div>
    </section>

    {/* Mission Section */}
    <section className="mission-section">
      <h2 className="mission-title">Our Mission</h2>
      
      <div className="mission-cards">
        <div className="mission-card">
          <div className="mission-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6"/>
              <path d="m1 12 6 0m6 0 6 0"/>
            </svg>
          </div>
          <h3>Simplify Personal Finance</h3>
          <p>Make financial management accessible and intuitive for everyone.</p>
        </div>

        <div className="mission-card">
          <div className="mission-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z"/>
            </svg>
          </div>
          <h3>Empower Users</h3>
          <p>Provide the tools and insights needed to make informed financial decisions.</p>
        </div>

        <div className="mission-card">
          <div className="mission-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5Z"/>
              <path d="M8 11l2 2 4-4"/>
            </svg>
          </div>
          <h3>Secure & Reliable</h3>
          <p>Transparent secure platform that users can trust with their financial data.</p>
        </div>
      </div>
    </section>

    {/* Testimonials Section */}
    <Testimonials />
  </div>
);

export default About;
