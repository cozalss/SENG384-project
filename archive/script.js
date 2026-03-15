document.addEventListener('DOMContentLoaded', () => {

    // 1. Cihaz Tipi Kontrolü (Mobil mi?)
    const isMobile = ('ontouchstart' in document.documentElement) || (window.innerWidth < 768);

    // Scroll Başa Alma
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 2. Custom Cursor Logic (Optimize Edilmiş LERP Takip)
    const cursor = document.querySelector('.cursor');
    const cursor2 = document.querySelector('.cursor2');

    if (!isMobile) {
        document.body.classList.add('custom-cursor-active');

        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;

        // Fare koordinatlarını güncelle
        window.addEventListener("mousemove", e => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Küçük nokta anlık takip (Gecikmesiz)
            gsap.set(cursor, { x: mouseX, y: mouseY });
        });

        // Animasyon döngüsü (Halka için yumuşak takip - LERP)
        // Bu yöntem en yüksek performansı ve en pürüzsüz "peşinden gelme" hissini verir.
        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());

            ringX += (mouseX - ringX) * dt;
            ringY += (mouseY - ringY) * dt;

            gsap.set(cursor2, { x: ringX, y: ringY });
        });

    } else {
        if (cursor) cursor.style.display = 'none';
        if (cursor2) cursor2.style.display = 'none';
    }

    // 3. Preloader ve Giriş
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
        initAnimations();
        typeWriter();
    }, 800);

    // 4. Particles.js - Mobilde daha az partikül
    tsParticles.load('particles-js', {
        fpsLimit: 60,
        particles: {
            number: { value: isMobile ? 20 : 60, density: { enable: true, area: 800 } }, // Mobilde azaltıldı
            color: { value: "#00ff99" },
            shape: { type: "circle" },
            opacity: { value: 0.3, random: true },
            size: { value: 3, random: true },
            move: { enable: true, speed: 1, direction: "none", outModes: "out" },
            links: {
                enable: true,
                distance: 150,
                color: "#00ff99",
                opacity: 0.2,
                width: 1
            }
        },
        interactivity: {
            events: {
                onHover: { enable: !isMobile, mode: "grab" }, // Mobilde hover kapatıldı
                onClick: { enable: true, mode: "push" }
            },
            modes: {
                grab: { distance: 140, links: { opacity: 1 } }
            }
        },
        detectRetina: true
    });

    // 5. Vanilla Tilt (Sadece Masaüstünde)
    if (!isMobile) {
        VanillaTilt.init(document.querySelectorAll(".skill-card, .certificate-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
        });
    }

    // 6. Typewriter Efekti
    const textToType = "Architecting Scalable AI & Cloud Solutions...";
    const subtitleElement = document.querySelector('.hero-subtitle');
    let typeIndex = 0;

    function typeWriter() {
        if (typeIndex < textToType.length) {
            subtitleElement.innerHTML += textToType.charAt(typeIndex);
            typeIndex++;
            setTimeout(typeWriter, 50);
        } else {
            subtitleElement.innerHTML += '<span class="cursor-blink">|</span>';
        }
    }

    // 7. GSAP Animasyonları & Lenis (Smooth Scroll)
    gsap.registerPlugin(ScrollTrigger);

    // 7. GSAP Animasyonları
    gsap.registerPlugin(ScrollTrigger);

    function initAnimations() {
        gsap.from("nav", { duration: 1.5, y: -100, opacity: 0, ease: "power4.out" });
        gsap.from(".hero-title", { duration: 1.5, y: 50, opacity: 0, ease: "power4.out", delay: 0.2 });
        gsap.utils.toArray('section').forEach(section => {
            gsap.from(section.querySelectorAll('.section-title, .skills-container, .certificates-container, .social-btn'), {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1
            });
        });
    }

    // --- HACKER TEXT EFFECT (Matrix Style) ---
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

    document.querySelectorAll(".nav-links a, .title").forEach(item => {
        item.addEventListener("mouseover", event => {
            let iteration = 0;
            const originalText = event.target.innerText; // Orijinal metni sakla

            // Eğer data-value yoksa ilk defada ata
            if (!event.target.dataset.value) event.target.dataset.value = originalText;

            clearInterval(item.interval);

            item.interval = setInterval(() => {
                event.target.innerText = event.target.innerText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return event.target.dataset.value[index];
                        }
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("");

                if (iteration >= event.target.dataset.value.length) {
                    clearInterval(item.interval);
                }

                iteration += 1 / 3;
            }, 30);
        });
    });

    // 8. Terminal Mantığı (Düzeltilmiş)
    const cliInput = document.getElementById('cliInput');
    const terminalBody = document.getElementById('terminalBody');

    // Komut İşleme Fonksiyonu
    function handleCommand(command) {
        addToTerminal(`cem@guest:~$ ${command}`);

        const cmd = command.trim().toLowerCase();

        switch (cmd) {
            case 'help':
                addToTerminal('Available commands: <br> - whoami: Who makes this? <br> - stack: Tech stack info <br> - certificates: View credentials <br> - social: Social accounts <br> - clear: Clear screen', 'highlight');
                break;
            case 'whoami':
                addToTerminal('Cem Özal. DevOps Engineer specializing in MLOps & Cloud Architectures.');
                break;
            case 'stack':
                addToTerminal('AWS, Kubernetes, Docker, Python, Terraform, Linux.');
                break;
            case 'certificates':
                addToTerminal('AWS Certified Cloud Practitioner (Issued Feb 2026). <br> <a href="https://www.credly.com/badges/51980dd9-c346-4ad0-80e8-0f3493a66916/public_url" target="_blank" style="color: #00ff99;">[View Badge]</a>');
                break;
            case 'contact':
            case 'social':
                addToTerminal('Email: cemmozal@gmail.com <br> GitHub: github.com/cemozal <br> LinkedIn: linkedin.com/in/cemozal');
                break;
            case 'clear':
                clearTerminal();
                return; // clear fonksiyonu içinden devam etmeye gerek yok
            default:
                if (cmd !== '') {
                    addToTerminal(`Command not found: ${cmd}. Type 'help' for list.`, 'error');
                }
        }
    }

    // Terminal Temizleme Fonksiyonu (DOM'u bozmadan)
    function clearTerminal() {
        // Sabit başlık dışındaki çıktıları temizle
        const outputs = terminalBody.querySelectorAll('.output');
        outputs.forEach(el => el.remove());
    }

    function addToTerminal(text, type = '') {
        const div = document.createElement('div');
        div.className = 'output';
        div.innerHTML = text;
        if (type === 'error') div.style.color = '#ff5f56';
        if (type === 'highlight') div.style.color = '#00ff99';

        // Input satırından HEMEN ÖNCE ekle
        const inputLine = terminalBody.querySelector('.input-line');
        terminalBody.insertBefore(div, inputLine);

        // Scroll'u en aşağı çek
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    if (cliInput) {
        cliInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const command = this.value;
                this.value = ''; // Input'u temizle
                handleCommand(command);
            }
        });

        // Terminale tıklandığında input'a odaklan
        document.querySelector('.terminal-window').addEventListener('click', () => {
            cliInput.focus();
        });
    }

    // 9. Sound Engine (Ses Efektleri - Web Audio API)
    const soundToggle = document.getElementById('sound-toggle');
    let toggleIcon, toggleText;

    // Elementlerin varlığını kontrol et (hatayı önlemek için)
    if (soundToggle) {
        toggleIcon = soundToggle.querySelector('i');
        toggleText = soundToggle.querySelector('span');
    }

    let audioCtx = null;
    let isSoundOn = false;

    // Ses Motoru Başlatıcı
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Basit "Bip" Sesi Üretici (Synthesizer)
    function playSound(type) {
        if (!isSoundOn || !audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'hover') {
            // İnce, kısa, fütüristik tık sesi
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'click') {
            // Biraz daha tok onay sesi
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }

    // Toggle Butonu Mantığı
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            if (!isSoundOn) {
                initAudio(); // İlk tıklamada başlat
                isSoundOn = true;
                if (toggleText) toggleText.textContent = "SOUND: ON";
                if (toggleIcon) toggleIcon.className = "fas fa-volume-up";
                soundToggle.style.borderColor = "var(--primary-color)";
                playSound('click'); // Açılış sesi
            } else {
                isSoundOn = false;
                if (toggleText) toggleText.textContent = "SOUND: OFF";
                if (toggleIcon) toggleIcon.className = "fas fa-volume-mute";
                soundToggle.style.borderColor = "var(--glass-border)";
            }
        });
    }

    // Elementlere Ses Bağlama (Navigasyon, Butonlar, Kartlar)
    const interactiveElements = document.querySelectorAll('a, button, .skill-card, .certificate-card, .terminal-button, .social-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => playSound('hover'));
        el.addEventListener('click', () => playSound('click'));
    });


    // 10. Location Detector (Konum Güncelleme)
    const locationSpan = document.getElementById('user-location');

    if (locationSpan) {
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                if (data.city && data.country_code) {
                    locationSpan.innerText = `${data.city.toUpperCase()}, ${data.country_code}`;
                } else {
                    locationSpan.innerText = "EARTH (SECURE)";
                }
            })
            .catch(() => {
                locationSpan.innerText = "EARTH (ANONYMOUS)";
            });
    }

});