/**
 * "Un Best Friend Ah Nan Kaathutu Iruppen"
 * Interactive Logic for Dhana's Apology Webpage
 * Sender: Vimala | Receiver: Dhana (Dhanasekar)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const envelopeBox = document.getElementById('envelope-box');
  const openBtn = document.getElementById('open-btn');
  const letterIntroReveal = document.getElementById('letter-intro-reveal');
  const typewriterElem = document.getElementById('typewriter-text');
  const scrollIndicator = document.getElementById('scroll-indicator');
  const contentStream = document.getElementById('content-stream');
  const screenDimmer = document.getElementById('screen-dimmer');
  const lastThingBtn = document.getElementById('last-thing-btn');
  const lastThingBox = document.getElementById('last-thing-box');
  const closeLetterBtn = document.getElementById('close-letter-btn');
  const dawnScreen = document.getElementById('dawn-screen');
  const reopenBtn = document.getElementById('reopen-btn');

  let isOpened = false;

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----------------------------------------------------------------------
  // 1. Particle Canvas System (Stars, Dust, Tiny Paper Flecks)
  // ----------------------------------------------------------------------
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationFrameId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.8 + 0.5;
      this.speedY = Math.random() * 0.35 + 0.1;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.fadeSpeed = (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1);
      this.color = Math.random() > 0.4 ? '201, 138, 150' : '226, 232, 240'; // Rose or subtle silver
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.opacity += this.fadeSpeed;

      if (this.opacity <= 0.1 || this.opacity >= 0.8) {
        this.fadeSpeed = -this.fadeSpeed;
      }

      if (this.y < -10) this.y = canvas.height + 10;
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(${this.color}, 0.5)`;
      ctx.fill();
    }
  }

  function initParticles() {
    if (prefersReducedMotion) return;
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 45);
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    if (prefersReducedMotion) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    animationFrameId = requestAnimationFrame(animateParticles);
  }

  initParticles();
  if (!prefersReducedMotion) {
    animateParticles();
  }

  // ----------------------------------------------------------------------
  // 2. Typewriter Effect (ONLY for one specific line)
  // ----------------------------------------------------------------------
  const typewriterText = "Some things are easier to type than to say.";
  let typeIndex = 0;

  function startTypewriter() {
    if (prefersReducedMotion) {
      typewriterElem.textContent = typewriterText;
      typewriterElem.classList.add('cursor-done');
      return;
    }

    typewriterElem.textContent = '';
    typeIndex = 0;

    function type() {
      if (typeIndex < typewriterText.length) {
        typewriterElem.textContent += typewriterText.charAt(typeIndex);
        typeIndex++;
        setTimeout(type, 55);
      } else {
        setTimeout(() => {
          typewriterElem.classList.add('cursor-done');
        }, 1200);
      }
    }
    type();
  }

  // ----------------------------------------------------------------------
  // 3. Envelope Opening Interaction
  // ----------------------------------------------------------------------
  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    envelopeBox.classList.add('opened');
    openBtn.style.opacity = '0';
    openBtn.style.pointerEvents = 'none';

    setTimeout(() => {
      letterIntroReveal.classList.add('show');
      startTypewriter();
      scrollIndicator.classList.add('show');
      contentStream.classList.add('active');
      contentStream.setAttribute('aria-hidden', 'false');

      // Initialize Intersection Observers after letter is revealed
      setupScrollObservers();
    }, 900);
  }

  envelopeWrapper.addEventListener('click', openEnvelope);
  envelopeWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });
  openBtn.addEventListener('click', openEnvelope);

  // ----------------------------------------------------------------------
  // 4. Scroll Reveal via IntersectionObserver
  // ----------------------------------------------------------------------
  function setupScrollObservers() {
    const sections = document.querySelectorAll('.letter-section');
    const questionItems = document.querySelectorAll('.chat-question-item');
    const thanksSection = document.getElementById('section-thanks');

    if (prefersReducedMotion) {
      sections.forEach(s => s.classList.add('revealed'));
      questionItems.forEach(q => q.classList.add('revealed'));
      return;
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // If it's Section 6, trigger the question reveals
          if (entry.target.id === 'section-thanks') {
            questionItems.forEach(q => q.classList.add('revealed'));
          }
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(sec => sectionObserver.observe(sec));

    // Dimming effect when "Thanks for everything" section is prominently in view
    const dimObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          screenDimmer.classList.add('active');
          setTimeout(() => {
            screenDimmer.classList.remove('active');
          }, 2200);
        }
      });
    }, {
      threshold: 0.4
    });

    if (thanksSection) {
      dimObserver.observe(thanksSection);
    }
  }

  // ----------------------------------------------------------------------
  // 5. "One last thing..." Reveal Interaction
  // ----------------------------------------------------------------------
  lastThingBtn.addEventListener('click', () => {
    const isRevealed = lastThingBox.classList.contains('revealed');
    if (!isRevealed) {
      lastThingBox.classList.add('revealed');
      lastThingBtn.innerHTML = '<span>Thank you for reading</span> <span aria-hidden="true">♡</span>';
    }
  });

  // ----------------------------------------------------------------------
  // 6. Close Letter & Transition to Tranquil Dawn Screen
  // ----------------------------------------------------------------------
  closeLetterBtn.addEventListener('click', () => {
    // Smoothly transition from midnight to dawn
    dawnScreen.classList.add('active');
    document.body.style.backgroundColor = 'var(--bg-dawn)';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Reopen Letter option
  reopenBtn.addEventListener('click', () => {
    dawnScreen.classList.remove('active');
    document.body.style.backgroundColor = 'var(--bg-midnight)';
  });
});
