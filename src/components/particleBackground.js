import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

const ParticleBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      init={particlesInit}
      options={{
        fullScreen: { enable: false }, // Ensures it doesn't take the whole page
        background: { color: "transparent" }, // Transparent background
        particles: {
          number: { value: 30, density: { enable: true, value_area: 800 } },
          color: { value: "#ffffff" }, // White particles
          shape: { type: "circle" },
          opacity: { value: 0.5, random: true },
          size: { value: 6, random: true },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            outModes: { default: "out" },
          },
        },
        interactivity: {
          events: { onHover: { enable: true, mode: "repulse" } },
          modes: { repulse: { distance: 100, duration: 0.4 } },
        },
      }}
    />
  );
};

export default ParticleBackground;
