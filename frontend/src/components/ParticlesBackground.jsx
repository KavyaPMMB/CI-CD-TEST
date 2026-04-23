import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export function ParticlesBackground({ theme = "light" }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options = useMemo(() => {
    const dark = theme === "dark";
    return {
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 42, density: { enable: true, area: 900 } },
        color: { value: dark ? "#a5b4fc" : "#6366f1" },
        opacity: { value: dark ? 0.22 : 0.18 },
        size: { value: { min: 1, max: 3 } },
        links: {
          enable: true,
          distance: 140,
          color: dark ? "#818cf8" : "#4f46e5",
          opacity: dark ? 0.14 : 0.1,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.7,
          direction: "none",
          outModes: { default: "out" },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          resize: { enable: true },
        },
        modes: {
          repulse: { distance: 60, duration: 0.25 },
        },
      },
    };
  }, [theme]);

  if (!ready) return null;

  return (
    <Particles
      id="app-particles"
      className="absolute inset-0 z-0"
      options={options}
    />
  );
}
