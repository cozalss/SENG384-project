import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [health, setHealth] = useState(null);
  const [location, setLocation] = useState('DETECTING...');
  const [isSoundOn, setIsSoundOn] = useState(false);
  const audioCtxRef = useRef(null);
  const subtitleRef = useRef(null);
  const terminalBodyRef = useRef(null);
  const [terminalOutputs, setTerminalOutputs] = useState([
    { text: "Welcome to Cem's Interactive Shell v1.0", type: '' },
    { text: "Type <span class='cmd-keyword'>'help'</span> to see available commands.", type: '' }
  ]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // 1. Fetch Backend Data (Required for Homework)
    fetch(`${API_URL}/api/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error("Backend health check failed:", err));

    fetch(`${API_URL}/api/posts`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error("Failed to fetch posts:", err));

    // 2. Location Detection
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city && data.country_code) {
          setLocation(`${data.city.toUpperCase()}, ${data.country_code}`);
        } else {
          setLocation("EARTH (SECURE)");
        }
      })
      .catch(() => setLocation("EARTH (ANONYMOUS)"));

    // 3. Init UI components carefully
    const initUI = () => {
      // Particles
      if (window.tsParticles) {
        window.tsParticles.load('particles-js', {
          fpsLimit: 60,
          particles: {
            number: { value: 60, density: { enable: true, area: 800 } },
            color: { value: "#00ff99" },
            shape: { type: "circle" },
            opacity: { value: 0.3, random: true },
            size: { value: 3, random: true },
            move: { enable: true, speed: 1, direction: "none", outModes: "out" },
            links: { enable: true, distance: 150, color: "#00ff99", opacity: 0.2, width: 1 }
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" } },
            modes: { grab: { distance: 140, links: { opacity: 1 } } }
          },
          detectRetina: true
        });
      }

      // GSAP
      if (window.gsap) {
        const gsap = window.gsap;
        if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
        
        gsap.from("nav", { duration: 1.5, y: -100, opacity: 0, ease: "power4.out" });
        gsap.from(".hero-title", { duration: 1.5, y: 50, opacity: 0, ease: "power4.out", delay: 0.2 });
      }

      // Vanilla Tilt
      if (window.VanillaTilt) {
        window.VanillaTilt.init(document.querySelectorAll(".skill-card, .certificate-card"), {
          max: 15,
          speed: 400,
          glare: true,
          "max-glare": 0.2,
        });
      }
    };

    // Preloader handle
    const timer = setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) preloader.classList.add('hidden');
      initUI();
      startTypewriter();
    }, 800);

    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    const cursor2 = document.querySelector('.cursor2');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursor && window.gsap) {
        window.gsap.set(cursor, { x: mouseX, y: mouseY });
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    let rafId;
    const ticker = () => {
      const dt = 0.15;
      ringX += (mouseX - ringX) * dt;
      ringY += (mouseY - ringY) * dt;
      if (cursor2 && window.gsap) {
        window.gsap.set(cursor2, { x: ringX, y: ringY });
      }
      rafId = requestAnimationFrame(ticker);
    };
    rafId = requestAnimationFrame(ticker);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const startTypewriter = () => {
    const textToType = "Architecting Scalable AI & Cloud Solutions...";
    let typeIndex = 0;
    const interval = setInterval(() => {
      if (typeIndex < textToType.length) {
        if (subtitleRef.current) subtitleRef.current.innerHTML = textToType.substring(0, typeIndex + 1);
        typeIndex++;
      } else {
        if (subtitleRef.current) subtitleRef.current.innerHTML += '<span class="cursor-blink">|</span>';
        clearInterval(interval);
      }
    }, 50);
  };

  const handleCommand = (command) => {
    const cmd = command.trim().toLowerCase();
    let newOutput = { text: `cem@guest:~$ ${command}`, type: '' };
    let response = null;

    switch (cmd) {
      case 'help':
        response = { text: 'Available commands: <br> - whoami: Who makes this? <br> - stack: Tech stack info <br> - social: My social links <br> - clear: Clear screen', type: 'highlight' };
        break;
      case 'whoami':
        response = { text: 'Cem Özal. DevOps Engineer specializing in MLOps & Cloud Architectures.' };
        break;
      case 'stack':
        response = { text: 'AWS, Kubernetes, Docker, Python, Terraform, Linux.' };
        break;
      case 'social':
        response = { text: 'GitHub: <a href="https://github.com/cozalss" target="_blank">cozalss</a> <br> LinkedIn: <a href="https://www.linkedin.com/in/cem-%C3%B6zal-5b9b2226a" target="_blank">Cem Özal</a>', type: 'highlight' };
        break;
      case 'clear':
        setTerminalOutputs([]);
        return;
      default:
        if (cmd !== '') response = { text: `Command not found: ${cmd}. Type 'help' for list.`, type: 'error' };
    }

    setTerminalOutputs(prev => response ? [...prev, newOutput, response] : [...prev, newOutput]);
    setTimeout(() => {
        if (terminalBodyRef.current) terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }, 10);
  };

  const playSound = (type) => {
    if (!isSoundOn) return;
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'hover') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.05, now);
      osc.start(now); osc.stop(now + 0.05);
    } else {
      osc.type = 'square'; osc.frequency.setValueAtTime(400, now); gain.gain.setValueAtTime(0.05, now);
      osc.start(now); osc.stop(now + 0.1);
    }
  };

  return (
    <>
      {/* Sound Toggle Button */}
      <div id="sound-toggle" className="sound-toggle-btn" onClick={() => { playSound('click'); setIsSoundOn(!isSoundOn); }}>
        <i className={isSoundOn ? "fas fa-volume-up" : "fas fa-volume-mute"}></i>
        <span>SOUND: {isSoundOn ? 'ON' : 'OFF'}</span>
      </div>

      {/* Custom Cursor */}
      <div className="cursor"></div>
      <div className="cursor2"></div>

      {/* Preloader */}
      <div id="preloader">
        <div className="loader-text">SYSTEM_BOOT...</div>
      </div>

      {/* Background Particles */}
      <div id="particles-js"></div>

      <header>
        <nav>
          <div className="logo" onMouseEnter={() => playSound('hover')}>
            <p className="title">&lt;CemOzal /&gt;</p>
          </div>
          <ul className="nav-links">
            <li><a href="#home" onMouseEnter={() => playSound('hover')}>/root</a></li>
            <li><a href="#skills" onMouseEnter={() => playSound('hover')}>/skills</a></li>
            <li><a href="#certificates" onMouseEnter={() => playSound('hover')}>/certificates</a></li>
            <li><a href="#contact" onMouseEnter={() => playSound('hover')}>/contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="home">
          <div className="hero">
            <h2 className="hero-title" data-text="Cem Özal">Cem Özal</h2>
            <h3 className="hero-subtitle" ref={subtitleRef}></h3>
          </div>

          <div className="terminal-window" onMouseEnter={() => playSound('hover')} onClick={() => document.getElementById('cliInput').focus()}>
            <div className="terminal-header">
              <span className="terminal-button red"></span>
              <span className="terminal-button yellow"></span>
              <span className="terminal-button green"></span>
              <span className="terminal-title">cem@server:~$ ./portfolio</span>
            </div>
            <div className="terminal-body" id="terminalBody" ref={terminalBodyRef}>
              {terminalOutputs.map((out, i) => (
                <div key={i} className="output" style={{ color: out.type === 'error' ? '#ff5f56' : out.type === 'highlight' ? '#00ff99' : '#f0f0f0' }} dangerouslySetInnerHTML={{ __html: out.text }}></div>
              ))}
              <div className="input-line">
                <span className="prompt">cem@guest:~$</span>
                <input type="text" id="cliInput" autoComplete="off" autoFocus onKeyPress={(e) => { if (e.key === 'Enter') { handleCommand(e.target.value); e.target.value = ''; playSound('click'); } }} />
              </div>
            </div>
          </div>
        </section>

        <section id="skills">
          <h2 className="section-title">Technology Stack</h2>
          <div className="skills-container">
            {[ 
              {name: "Python & ML", icon: "fa-python"}, 
              {name: "AWS Cloud", icon: "fa-aws"}, 
              {name: "Docker", icon: "fa-docker"}, 
              {name: "Kubernetes", icon: "fa-dharmachakra"}, 
              {name: "Linux SysAdmin", icon: "fa-linux"}, 
              {name: "Terraform (IaC)", icon: "fa-server"}, 
              {name: "GitOps", icon: "fa-git-alt"} 
            ].map((skill, i) => (
              <div key={i} className="skill-card" data-tilt onMouseEnter={() => playSound('hover')}>
                <div className="card-content">
                  <i className={`fab ${skill.icon}`}></i>
                  <p>{skill.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="certificates">
          <h2 className="section-title">Certificates</h2>
          <div className="certificates-container">
            <a href="https://www.credly.com/badges/51980dd9-c346-4ad0-80e8-0f3493a66916/public_url" target="_blank" className="certificate-card" data-tilt onMouseEnter={() => playSound('hover')}>
              <div className="cert-image-wrapper">
                <img src="https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Cloud-Practitioner_badge.634f8a21af2e0e956ed8905a72366146ba22b74c.png" alt="AWS CCP Badge" />
              </div>
              <div className="cert-info">
                <h3>AWS Certified Cloud Practitioner</h3>
                <p className="cert-issuer">Amazon Web Services (AWS)</p>
                <span className="cert-date">Issued Feb 2026</span>
                <div className="cert-verify-btn"><i className="fas fa-external-link-alt"></i> Verify</div>
              </div>
            </a>
          </div>
        </section>

        {/* --- ASSIGNMENT BACKEND DATA --- */}
        <section id="assignment-data" style={{ marginTop: '5rem', borderTop: '1px dashed var(--primary-color)', paddingTop: '3rem' }}>
          <h2 className="section-title">Backend Status (HW)</h2>
          <div className="assignment-info" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', background: 'rgba(0,255,153,0.03)', padding: '2rem', borderRadius: '12px' }}>
            {health ? (
              <p style={{ color: 'var(--primary-color)', fontFamily: 'var(--mono-font)' }}>SYSTEM_STATUS: {health.status} :: {health.message}</p>
            ) : (
              <p style={{ color: '#ff5f56', fontFamily: 'var(--mono-font)' }}>SYSTEM_OFFLINE: Could not connect to backend.</p>
            )}
            
            <div className="db-posts" style={{ marginTop: '2rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Fetched DB Records:</h3>
              {posts.map(post => (
                <div key={post.id} className="post-card" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                   <h4 style={{ color: 'var(--primary-color)', margin: '0' }}>{post.title}</h4>
                   <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#888' }}>Tech: {post.expertise_needed} | {post.city}</p>
                   <span style={{ fontSize: '0.7rem', background: 'var(--primary-color)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{post.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact">
          <h2 className="section-title">Contact</h2>
          <a href="mailto:cemmozal@gmail.com" className="contact-box-container">
            <div className="contact-box" onMouseEnter={() => playSound('hover')}>
              <div className="icon-circle"><i className="fas fa-paper-plane"></i></div>
              <h3>Send Message</h3>
              <p className="sub-text">Click to send an email</p>
            </div>
          </a>
          <div className="social-links">
            <a href="https://github.com/cozalss" target="_blank" className="social-btn" onMouseEnter={() => playSound('hover')}>GitHub</a>
            <a href="https://www.linkedin.com/in/cem-%C3%B6zal-5b9b2226a" target="_blank" className="social-btn" onMouseEnter={() => playSound('hover')}>LinkedIn</a>
          </div>
        </section>
      </main>

      <footer className="system-footer">
        <div className="status-item"><span className="status-dot blink"></span> SYSTEM: ONLINE</div>
        <div className="status-item">LOCATION: <span id="user-location">{location}</span></div>
        <div className="status-item">LATENCY: <span id="latency">24ms</span></div>
      </footer>
    </>
  );
}

export default App;
