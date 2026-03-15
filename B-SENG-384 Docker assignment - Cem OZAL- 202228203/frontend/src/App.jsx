import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- COMPONENTS ---

const Navigation = () => {
  return (
    <nav>
      <div className="logo">
        <Link to="/" className="title">&lt;CemManagement /&gt;</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">/register</Link></li>
        <li><Link to="/people">/database</Link></li>
      </ul>
    </nav>
  );
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'TRANSMITTING...' });

    try {
      const res = await fetch(`${API_URL}/api/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'AGENT_REGISTERED_SUCCESSFULLY' });
        setFormData({ full_name: '', email: '' });
        setTimeout(() => navigate('/people'), 1500);
      } else {
        setStatus({ type: 'error', message: data.error || 'REGISTRATION_FAILED' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'SERVER_OFFLINE' });
    }
  };

  return (
    <div className="terminal-window registration-box">
      <div className="terminal-header">
        <span className="terminal-button red"></span>
        <span className="terminal-button yellow"></span>
        <span className="terminal-button green"></span>
        <span className="terminal-title">system@cmd:~$ ./register_agent</span>
      </div>
      <div className="terminal-body" style={{ height: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>FULL_NAME:</label>
            <input 
              type="text" 
              required 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="input-group">
            <label>EMAIL_ADDRESS:</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="e.g. agent007@intel.com"
            />
          </div>
          <button type="submit" className="social-btn" style={{ width: '100%', marginTop: '1rem', cursor: 'pointer' }}>
            INITIALIZE_REGISTRATION
          </button>
        </form>
        {status.message && (
          <div className={`status-msg ${status.type}`} style={{ marginTop: '1rem' }}>
            &gt; {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

const PeopleList = () => {
  const [people, setPeople] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '' });

  const fetchPeople = async () => {
    try {
      const res = await fetch(`${API_URL}/api/people`);
      const data = await res.json();
      setPeople(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("CONFIRM_DELETION?")) return;
    try {
      await fetch(`${API_URL}/api/people/${id}`, { method: 'DELETE' });
      fetchPeople();
    } catch (err) {
      alert("DELETION_FAILED");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/people/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        fetchPeople();
      }
    } catch (err) {
      alert("UPDATE_FAILED");
    }
  };

  return (
    <section id="database" style={{ padding: '2rem 0' }}>
      <h2 className="section-title">Authorized Personnel</h2>
      
      {editingId && (
        <div className="terminal-window edit-modal" style={{ marginBottom: '2rem', maxWidth: '800px' }}>
           <div className="terminal-header">
              <span className="terminal-title">MODE: EDIT_RECORD_{editingId}</span>
              <button onClick={() => setEditingId(null)} className="terminal-button red" style={{ marginLeft: 'auto', border: 'none', cursor: 'pointer' }}></button>
           </div>
           <div className="terminal-body" style={{ height: 'auto' }}>
              <form onSubmit={handleUpdate} className="edit-form">
                <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} required />
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} required />
                <button type="submit" className="social-btn">APPLY_CHANGES</button>
              </form>
           </div>
        </div>
      )}

      <div className="assignment-info" style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '12px' }}>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono-font)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>NAME</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>EMAIL</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {people.map(person => (
                <tr key={person.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>#{person.id}</td>
                  <td style={{ padding: '1rem', color: '#fff' }}>{person.full_name}</td>
                  <td style={{ padding: '1rem', color: '#888' }}>{person.email}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => { setEditingId(person.id); setEditForm({full_name: person.full_name, email: person.email}); }} 
                      className="action-btn edit"
                    >EDIT</button>
                    <button 
                      onClick={() => handleDelete(person.id)} 
                      className="action-btn delete"
                    >DELETE</button>
                  </td>
                </tr>
              ))}
              {people.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>NO_RECORDS_FOUND_IN_DATABASE</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// --- MAIN APP ---

function AppContent() {
  const [location, setLocation] = useState('DETECTING...');

  useEffect(() => {
    // 1. Initial UI Setup (Particles, etc.)
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
        }
      });
    }

    // 2. Fetch Location
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city) setLocation(`${data.city.toUpperCase()}, ${data.country_code}`);
        else setLocation("EARTH (SECURE)");
      })
      .catch(() => setLocation("EARTH (ANONYMOUS)"));

    // 3. Custom Cursor
    const cursor = document.querySelector('.cursor');
    const cursor2 = document.querySelector('.cursor2');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (cursor && window.gsap) window.gsap.set(cursor, { x: mouseX, y: mouseY });
    };
    window.addEventListener('mousemove', onMouseMove);

    const ticker = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (cursor2 && window.gsap) window.gsap.set(cursor2, { x: ringX, y: ringY });
      requestAnimationFrame(ticker);
    };
    ticker();

    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <>
      <div className="cursor"></div>
      <div className="cursor2"></div>
      <div id="particles-js"></div>

      <header>
        <Navigation />
      </header>

      <main style={{ paddingTop: '8rem', minHeight: '80vh' }}>
        <div className="content-wrapper" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
          <Routes>
            <Route path="/" element={<RegistrationForm />} />
            <Route path="/people" element={<PeopleList />} />
          </Routes>
        </div>
      </main>

      <footer className="system-footer">
        <div className="status-item"><span className="status-dot blink"></span> SECURE_LINE: ACTIVE</div>
        <div className="status-item">LOCATION: {location}</div>
        <div className="status-item">DOCKER_STATUS: <span style={{ color: 'var(--primary-color)' }}>HEALTHY</span></div>
      </footer>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
