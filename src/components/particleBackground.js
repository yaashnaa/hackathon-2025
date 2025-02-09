import React, { useEffect, useState } from "react";
import "../styles/particlebg.css"; // Import the converted CSS

const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const numParticles = 100; // Adjust number of particles
    const newParticles = Array.from({ length: numParticles }, (_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 10) + 5, // Random size
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      animationDuration: `${Math.random() * 10 + 5}s`,
      animationDelay: `${Math.random() * 5}s`,
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="container">
      <img
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/221808/sky.jpg"
        className="background"
        alt="Background"
      />
      <p className="message">
        All your dreams can come true<br />
        if you have the courage to pursue them
      </p>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="circle-container"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: particle.left,
            top: particle.top,
            animationDuration: particle.animationDuration,
            animationDelay: particle.animationDelay,
          }}
        >
          <div className="circle"></div>
        </div>
      ))}
    </div>
  );
};

export default ParticleBackground;
