import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <h1>About Woow Foods</h1>
          <p>Healthy, Affordable, and Delicious Food </p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>Our Story</h2>
            <p>
              Woow Foods was founded in August 2016 by Noxolisa Ruth Ndyalivani, a highly motivated 
              entrepreneur from Khayelitsha, Cape Town. After completing an entrepreneurship course 
              from the University of Stellenbosch (where she graduated as the top entrepreneurship 
              student), Noxolisa identified a gap in the market for healthier, more affordable street 
              food options.
            </p>
            <p>
              She noticed that street food restaurants at the time were selling unhealthy food to locals, 
              did not value customer service, and food security standards were not being met. This 
              inspired her to launch Woow Foods with a mission to bring fresh, healthier, and more 
              affordable alternatives to street food consumers, along with exceptional customer service.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Journey</h2>
            <div className="journey-timeline">
              <div className="timeline-item">
                <div className="timeline-year">2016</div>
                <div className="timeline-content">
                  <h3>Launch</h3>
                  <p>Woow Foods began as a small stall at a train station, selling steamed bread, coffee, and homemade muffins on weekdays.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-year">2017-2018</div>
                <div className="timeline-content">
                  <h3>Expansion</h3>
                  <p>Expanded to a mobile kitchen that moved around various locations in Mowbray, including the University of the Western Cape.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-year">2019</div>
                <div className="timeline-content">
                  <h3>CPUT Partnership</h3>
                  <p>Started operating primarily in CPUT, eventually receiving space to operate in the cafeterias within the university campuses.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-year">Today</div>
                <div className="timeline-content">
                  <h3>Growing Success</h3>
                  <p>Now operating in multiple CPUT campuses, serving over 30,000 customers including students, lecturers, and staff members.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🍽️</div>
                <h3>Quality</h3>
                <p>Fresh ingredients and home-cooked meals that meet high food safety standards.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">💰</div>
                <h3>Affordability</h3>
                <p>Price-sensitive options that provide value without compromising on quality.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">😊</div>
                <h3>Customer Satisfaction</h3>
                <p>Exceptional service and an unforgettable experience for every customer.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🔄</div>
                <h3>Consistency</h3>
                <p>Reliable quality and service that keeps customers coming back.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>What We Offer</h2>
            <div className="offerings">
              <div className="offering-item">
                <h3>Daily Operations</h3>
                <p>Operating daily from 7:30 AM to 7:30 PM in CPUT cafeterias across Cape Town, Mowbray, and D6 campuses.</p>
              </div>
              <div className="offering-item">
                <h3>Menu Variety</h3>
                <p>Traditional Cape Town favorites including kotas, vetkoeks, chip rolls, gatsbys, burgers, and a range of beverages.</p>
              </div>
              <div className="offering-item">
                <h3>Catering Services</h3>
                <p>Available for CPUT workshops and events during the week, as well as external events and organizations on weekends.</p>
              </div>
              <div className="offering-item">
                <h3>On-Site Staff</h3>
                <p>Professional service staff provided during events to ensure smooth operations and customer satisfaction.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Team</h2>
            <p>
              Woow Foods operates with 8 dedicated employees, comprising 70% females and 30% males. 
              Our team is committed to maintaining high standards of hygiene, food safety, and customer 
              service. We work together to ensure that every meal served meets our quality standards 
              and provides value to our customers.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Locations</h2>
            <div className="locations-grid">
              <div className="location-card">
                <h3>Cape Town Campus</h3>
                <p>The busiest location, operating daily from 7:30 AM to 7:30 PM</p>
              </div>
              <div className="location-card">
                <h3>Mowbray Campus</h3>
                <p>Serving students and staff in the Mowbray area</p>
              </div>
              <div className="location-card">
                <h3>D6 Campus</h3>
                <p>Located in the CPUT District Six student centre</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
