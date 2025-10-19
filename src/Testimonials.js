import React from 'react';
import './App.css';

const Testimonials = () => (
  <section className="testimonials-section" id="testimonials">
    <h2>What Our Users Say</h2>
    <div className="testimonials-list">
      <div className="testimonial">
        <p>"Budget Buddy helped me finally get my spending under control. The interface is so easy!"</p>
        <span className="testimonial-author">— Alex R.</span>
      </div>
      <div className="testimonial">
        <p>"I love the goal tracking and reminders. Saving for my vacation was never this simple."</p>
        <span className="testimonial-author">— Jamie L.</span>
      </div>
      <div className="testimonial">
        <p>"The best personal finance app I've used. Highly recommend to anyone!"</p>
        <span className="testimonial-author">— Morgan S.</span>
      </div>
    </div>
  </section>
);

export default Testimonials;
