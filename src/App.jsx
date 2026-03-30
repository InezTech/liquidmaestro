import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Calendar, ArrowRight, Clock, Wine, Send, Mail, MapPin, Phone } from 'lucide-react';
import './index.css';

// Uses VITE_API_BASE env var in production (set on Netlify), falls back to localhost in dev
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const IS_PROD = Boolean(import.meta.env.VITE_API_BASE);
const WS_PROTOCOL = IS_PROD ? (import.meta.env.VITE_API_BASE.replace('https', 'wss').replace('http', 'ws')) : 'ws://localhost:8000/api';
const WS_BASE = `${WS_PROTOCOL}/ws`;

// ─── Static Fallback Data (shown when backend is unreachable) ─────────────────
const STATIC_MENU = [
  { id: 1, category: 'Signature Cocktails', name: 'Obsidian Old Fashioned', price: '$24', description: 'Activated charcoal, barrel-aged bourbon, dark cherry essence, and a hand-carved crystal ice sphere.', is_seasonal: 0 },
  { id: 2, category: 'Signature Cocktails', name: 'Midnight Gimlet', price: '$22', description: 'Botanical gin, fresh lime, nocturnal violet liqueur, and a whisper of elderflower.', is_seasonal: 1 },
  { id: 3, category: 'Signature Cocktails', name: 'Symphony in Gold', price: '$26', description: 'A golden blend of premium aged rum, saffron-infused honey, and aromatic bitters.', is_seasonal: 0 },
  { id: 4, category: 'Signature Cocktails', name: 'Velvet Underground', price: '$23', description: 'Aged mezcal, black cardamom, smoked rosemary, and a blood-orange reduction.', is_seasonal: 0 },
  { id: 5, category: 'Timeless Classics', name: 'The Perfect Negroni', price: '$19', description: 'A flawless 1-1-1 balance of London dry gin, sweet vermouth, and Campari. Stirred to perfection.', is_seasonal: 0 },
  { id: 6, category: 'Timeless Classics', name: 'Dry Martini', price: '$21', description: 'Bone-dry gin or vodka, a ghost of vermouth, and a hand-twisted citrus peel. No compromise.', is_seasonal: 0 },
  { id: 7, category: 'Timeless Classics', name: 'Old Fashioned', price: '$20', description: 'Rye whisky, Demerara sugar, Angostura bitters, a large ice cube. The gold standard.', is_seasonal: 0 },
  { id: 8, category: 'Spirits & Flights', name: 'Japanese Whisky Flight', price: '$48', description: 'A tasting of three exceptional Japanese single malts — Hibiki, Yamazaki 12, and Nikka From the Barrel.', is_seasonal: 0 },
  { id: 9, category: 'Spirits & Flights', name: 'Mezcal Terroir', price: '$38', description: 'Three small-batch mezcals from distinct agave varietals, served with orange, sal de gusano, and chapulines.', is_seasonal: 0 },
  { id: 10, category: 'Seasonal Specials', name: 'The Noir Series', price: '$28', description: 'Activated charcoal, dark aged rums, and striking black velvet finishes. Our signature seasonal expression.', is_seasonal: 1 },
  { id: 11, category: 'Seasonal Specials', name: 'Crimson Velvet', price: '$25', description: 'Raspberry-washed cognac, champagne bitters, hibiscus orgeat, and a rose-water mist finish.', is_seasonal: 1 },
];

const STATIC_EVENTS = [
  { id: 1, title: 'Vernissage: Industrial Noir', date: 'April 15th', description: 'An evening of monochromatic art installations, heavy bass, and limited-run cocktail expressions inspired by the works on display. Tickets available at the door.', category: 'Art & Music' },
  { id: 2, title: 'The Maestro Session', date: 'Every Friday', description: 'Live improvisational jazz meets rare whiskey tastings. Our resident musicians and guest distillers converge for an unmissable mid-week ritual.', category: 'Live Sessions' },
  { id: 3, title: 'Molecular Mixology Masterclass', date: 'May 3rd', description: 'Join our lead mixologist for an intimate workshop exploring spherification, liquid nitrogen, and the future of drink. Limited to 12 guests.', category: 'Workshop' },
];

const STATIC_BLOG = [
  { id: 1, title: 'The Geometry of Ice', author: 'The Maestro', date: 'March 2026', excerpt: 'Understanding the physics of the perfect chill.', content: 'In the realm of high-end mixology, the clarity and shape of ice is not an afterthought — it is a fundamental ingredient.\n\nA perfectly clear, large-format cube melts at a fraction of the rate of crushed ice, maintaining dilution precisely where you want it. The geometry matters: a 2-inch sphere has minimal surface area relative to its volume, chilling your spirit slowly and deliberately.\n\nAt Liquid Maestro, we directionally freeze all our ice using custom insulated molds, eliminating the air bubbles and impurities that cause cloudiness. The result is ice that belongs in a cocktail the way marble belongs in a gallery.', category: 'Technique' },
  { id: 2, title: 'Understanding Bitters', author: 'The Maestro', date: 'February 2026', excerpt: 'The invisible architecture of every great cocktail.', content: 'Bitters are the salt and pepper of the cocktail world — you rarely taste them directly, but you always notice their absence.\n\nOriginating as medicinal tinctures in the 19th century, bitters are concentrated botanical extracts: roots, barks, herbs, and citrus peels macerated in high-proof spirit.\n\nAt Liquid Maestro, we stock over 40 varieties — from the ubiquitous Angostura to our house-made activated charcoal bitters, which add a dark, smoky depth to our Obsidian Old Fashioned.\n\nThe next time you order a cocktail, ask for the same drink with and without bitters. The difference will permanently change how you think about mixology.', category: 'Education' },
  { id: 3, title: 'The Rise of Japanese Whisky', author: 'The Maestro', date: 'January 2026', excerpt: 'How the East rewrote the rules of whisky.', content: 'When Masataka Taketsuru returned from Scotland in 1920 with his Scottish wife — and the secrets of Scotch whisky — he could not have known he was laying the groundwork for an industry that would eventually outscore Scottish expressions at blind tastings.\n\nJapanese whisky embraces a philosophy of balance, subtlety, and precision that mirrors the broader aesthetic of Japanese craftsmanship. Where Scotch confronts you, Japanese whisky invites you.\n\nOur Japanese Whisky Flight features three expressions — Hibiki Harmony, Yamazaki 12, and Nikka From the Barrel — chosen to take you on a journey from delicate floral notes to rich, complex depth.', category: 'Culture' },
];

const fadeUpText = {
  hidden: { opacity: 0, y: 50, skewY: 2 },
  visible: { 
    opacity: 1, 
    y: 0, 
    skewY: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } 
  }
};

const fadeUpContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.15,
      delayChildren: 0.1
    } 
  }
};

const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const LiquidBackground = () => {
  const canvasRef = React.useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let w, h;
    const setCanvasSize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    const particles = [];
    const particleCount = 40;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.3 + 0.1
      });
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(184, 150, 91, 0.1)';
      ctx.lineWidth = 0.5;
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 150, 91, ${p.alpha})`;
        ctx.fill();
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="liquid-canvas-bg"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 0,
        opacity: 0.5
      }} 
    />
  );
};

function Home() {
  const [seasonalItems, setSeasonalItems] = useState([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then(res => res.json())
      .then(data => {
        const seasonal = Array.isArray(data) ? data.filter(item => item.is_seasonal === 1) : [];
        setSeasonalItems(seasonal);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* --- Hero Section --- */}
      <section className="hero" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <motion.div 
          className="hero-bg" 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          style={{ backgroundImage: 'url(/assets/hero_bg_1774801891627.png)' }}
        ></motion.div>
        
        <div className="hero-overlay"></div>

        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={fadeUpContainer}
          style={{ 
            perspective: 1000,
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: "preserve-3d"
          }}
        >
          <motion.div variants={fadeUpText} className="hero-eyebrow">
            EST. 2026 • DOWNTOWN LOS ANGELES
          </motion.div>
          
          <motion.h1 
            variants={fadeUpText} 
            className="hero-title"
            style={{ translateZ: 100 }}
          >
            <span className="title-top">Liquid</span>
            <span className="accent italic-glow">Artistry</span>
          </motion.h1>
          
          <motion.p variants={fadeUpText} className="hero-description" style={{ translateZ: 50 }}>
            Experience the definitive convergence of fine spirits, <br/> avant-garde mixology, and industrial elegance.
          </motion.p>
          
          <div className="hero-actions" style={{ translateZ: 30 }}>
            <motion.a variants={fadeUpText} href="#/menu" className="hero-btn-primary">
              Explore Menu
            </motion.a>
            
            <motion.a 
              variants={fadeUpText} 
              href="#/reservations" 
              className="hero-reservation-btn-premium resmio-button"
              data-resmio-id="liquid-maestro"
            >
              <Calendar size={20} />
              Book a Table
            </motion.a>
          </div>
        </motion.div>

        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span>Scroll to Discover</span>
        </motion.div>
      </section>

      {/* --- Intro Section --- */}
      <section className="intro container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpContainer}
        >
          <motion.p variants={fadeUpText}>
            Liquid Maestro, the newest hotspot in downtown Los Angeles. Our skilled mixologists are passionate about crafting exceptional cocktails that will delight your senses.
          </motion.p>
          <motion.div variants={fadeUpText} className="subtext">
            Step into a world of sophisticated ambiance and unparalleled service, blending classic elegance with modern innovation.
          </motion.div>
        </motion.div>
      </section>

      {/* --- Premium Hours & Seasonal Specials --- */}
      <section className="container">
        <div className="premium-split-wrapper">
          <motion.div 
            className="premium-split-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={cardReveal}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Clock size={32} color="var(--accent-color)" />
              <h3 className="split-title-glow" style={{ marginBottom: 0 }}>Opening Hours</h3>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <div className="hour-row-glow">
                <span>Mon - Thu</span>
                <span>5 PM - 12 AM</span>
              </div>
              <div className="hour-row-glow">
                <span>Fri - Sat</span>
                <span>5 PM - 2 AM</span>
              </div>
              <div className="hour-row-glow" style={{ borderBottom: 'none' }}>
                <span>Sun</span>
                <span>Closed</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="premium-split-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={cardReveal}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Wine size={32} color="var(--accent-color)" />
              <h3 className="split-title-glow" style={{ marginBottom: 0 }}>Seasonal Collections</h3>
            </div>

            <ul className="menu-list" style={{ marginTop: '2rem' }}>
              <AnimatePresence>
                {seasonalItems.length > 0 ? (
                  seasonalItems.slice(0, 3).map(item => (
                    <motion.li key={item.id} variants={fadeUpText}>
                      <div className="menu-list-top">
                        <h4>{item.name}</h4>
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                    </motion.li>
                  ))
                ) : (
                  <motion.li variants={fadeUpText}>
                    <div className="menu-list-top">
                      <h4>The Noir Series</h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Exclusive experimentation featuring activated charcoal, dark rums, and striking velvet finishes.</p>
                  </motion.li>
                )}
              </AnimatePresence>
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2rem' }}>
              <a href="#/menu" className="premium-cta-btn" style={{ padding: '0.8rem 2rem' }}>
                <span className="premium-cta-btn-bg"></span>
                <span style={{ position: 'relative', zIndex: 2 }}>Explore Menu</span>
                <span className="premium-cta-btn-icon" style={{ position: 'relative', zIndex: 2 }}>
                  <ArrowRight size={16} />
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>


    </>
  );
}

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = () => {
    fetch(`${API_BASE}/menu`)
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) && data.length > 0 ? data : STATIC_MENU;
        setMenuItems(items);
        setLoading(false);
      })
      .catch(() => {
        // API unreachable (e.g. Netlify static deploy) — use static data
        setMenuItems(STATIC_MENU);
        setLoading(false);
      });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMenu();

    // Only open WebSocket in local dev (when backend is actually running)
    if (!IS_PROD) {
      const ws = new WebSocket(WS_BASE);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'menu_updated') fetchMenu();
        } catch(e) {}
      };
      return () => ws.close();
    }
  }, []);

  const predefinedOrder = ["Signature Cocktails", "Timeless Classics", "Spirits & Flights", "Seasonal Specials"];
  const dynamicCategories = Array.from(new Set(menuItems.filter(i => i.category).map(item => item.category)));
  const categories = dynamicCategories.sort((a, b) => {
    let indexA = predefinedOrder.indexOf(a);
    let indexB = predefinedOrder.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    if (indexA !== indexB) return indexA - indexB;
    return a.localeCompare(b);
  });

  return (
    <div className="menu-page-container">
      <section className="intro container" style={{ paddingTop: '15rem', paddingBottom: '5rem' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          The Menu
        </motion.p>
        <motion.div 
          className="subtext"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          A meticulous curation of spirits, botanicals, and seasonal expressions.
        </motion.div>
      </section>

      <section className="container menu-categories">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading our curated selection...</div>
        ) : (
          categories.map(category => {
            const items = menuItems.filter(item => item.category === category);
            if (items.length === 0) return null;
            return (
              <motion.div 
                key={category}
                className="menu-category"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpContainer}
              >
                <h3 className="category-title">{category}</h3>
                <ul className="menu-list grid-menu">
                  {items.map(item => (
                    <motion.li key={item.id} className="menu-item-card" variants={cardReveal}>
                      {item.image_url && (
                        <div className="menu-item-image">
                          <img src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:8000${item.image_url}`} alt={item.name} />
                        </div>
                      )}
                      <div className="menu-item-content">
                        <div className="menu-list-top">
                          <h4>{item.name} {item.is_seasonal ? <span className="seasonal-indicator">SEASONAL</span> : ''}</h4>
                          <span className="price">{item.price}</span>
                        </div>
                        <p>{item.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })
        )}
      </section>
    </div>
  );
}


function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    fetch(`${API_BASE}/events`)
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) && data.length > 0 ? data : STATIC_EVENTS;
        setEvents(items);
        setLoading(false);
      })
      .catch(() => {
        setEvents(STATIC_EVENTS);
        setLoading(false);
      });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEvents();
    if (!IS_PROD) {
      const ws = new WebSocket(WS_BASE);
      ws.onmessage = (e) => { try { if (JSON.parse(e.data).event === 'events_updated') fetchEvents(); } catch(err) {} };
      return () => ws.close();
    }
  }, []);

  return (
    <div className="page-container">
      <section className="intro container" style={{ paddingTop: '15rem', paddingBottom: '3rem' }}>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          Curated Experiences
        </motion.p>
        <motion.div className="subtext" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          Join us for exclusive nights of live music, guest mixologists, and seasonal tastings.
        </motion.div>
      </section>
      
      <section className="container list-section">
        {loading ? <div style={{textAlign:'center', opacity:0.5}}>Loading events...</div> : 
         events.length === 0 ? <div style={{textAlign:'center', opacity:0.5}}>No upcoming events scheduled. Stay tuned.</div> :
         events.map(event => (
          <motion.div key={event.id} className="event-row" variants={cardReveal}>
             <div className="event-date">
               <span className="month">{event.date.split(' ')[0]}</span>
               <span className="day">{event.date.split(' ')[1]}</span>
             </div>
             <div className="event-details">
              {event.image_url && (
                <img 
                  src={event.image_url} 
                  alt={`Event: ${event.title}`} 
                  style={{width:'100%', height:'300px', objectFit:'cover', borderRadius:'4px', marginBottom:'2rem'}} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
               <span className="tag" style={{color:'var(--accent-color)', fontSize:'0.7rem', letterSpacing:'3px', marginBottom:'1rem', display:'block'}}>{event.category.toUpperCase()}</span>
               <h3>{event.title}</h3>
               <p>{event.description}</p>
             </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchBlog = () => {
    fetch(`${API_BASE}/blog`)
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) && data.length > 0 ? data : STATIC_BLOG;
        setPosts(items);
        setLoading(false);
      })
      .catch(() => {
        setPosts(STATIC_BLOG);
        setLoading(false);
      });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlog();
    if (!IS_PROD) {
      const ws = new WebSocket(WS_BASE);
      ws.onmessage = (e) => { try { if (JSON.parse(e.data).event === 'blog_updated') fetchBlog(); } catch(err) {} };
      return () => ws.close();
    }
  }, []);

  return (
    <div className="page-container">
      <section className="intro container" style={{ paddingTop: '15rem', paddingBottom: '3rem' }}>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          The Maestro's Journal
        </motion.p>
        <motion.div className="subtext" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          Musings on modern mixology, perfectly clear ice, and the art of hospitality.
        </motion.div>
      </section>
      
      <section className="container grid-blog">
         {loading ? <div style={{gridColumn:'1/-1', textAlign:'center', opacity:0.5}}>Archiving latest articles...</div> : 
          posts.length === 0 ? <div style={{gridColumn:'1/-1', textAlign:'center', opacity:0.5}}>No articles published yet.</div> :
          posts.map(post => (
          <motion.article key={post.id} className="blog-card" style={{display:'flex', flexDirection:'column'}} variants={cardReveal}>
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt={`Blog post: ${post.title}`} 
                style={{width:'100%', height:'200px', objectFit:'cover', borderRadius:'2px', marginBottom:'2rem'}} 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="blog-meta">{post.date} • {post.category}</div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div style={{marginTop:'auto'}}>
               <button 
                 onClick={() => setSelectedPost(post)} 
                 className="read-more"
                 style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                >
                 Read Article <span className="line"></span>
               </button>
            </div>
          </motion.article>
         ))}
      </section>

      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            className="blog-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
          >
            <motion.div 
              className="blog-content-modal"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-btn" onClick={() => setSelectedPost(null)}>×</button>
              
              <div className="blog-content-inner">
                {selectedPost.image_url && (
                  <div className="blog-featured-image">
                    <img 
                      src={selectedPost.image_url} 
                      alt={selectedPost.title} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                
                <div className="blog-article-body">
                  <div className="blog-meta-large">{selectedPost.date} • {selectedPost.category}</div>
                  <h1 className="blog-title-large">{selectedPost.title}</h1>
                  <div className="blog-rich-text">
                    {selectedPost.content.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(() => {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus(''), 5000);
    })
    .catch(() => setStatus('error'));
  };

  return (
    <div className="contact-page-wrapper">
      <section className="container contact-header">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="eyebrow-glow">CENTRAL COMMUNICATIONS</span>
          <h1 className="premium-title">Establish Contact</h1>
          <p className="subtitle-faded">The Maestro is always listening. Reach out for event inquiries, private bookings, or digital discourse.</p>
        </motion.div>
      </section>

      <section className="container contact-main-grid">
        {/* Left: Contact Info */}
        <motion.div 
          className="contact-sidebar"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="info-card-premium">
            <div className="info-icon-box"><Mail size={24} /></div>
            <div className="info-content">
              <label>Digital Correspondence</label>
              <a href="mailto:info@liquidmaestro.com">info@liquidmaestro.com</a>
            </div>
          </div>

          <div className="info-card-premium">
            <div className="info-icon-box"><Phone size={24} /></div>
            <div className="info-content">
              <label>Direct Voice Line</label>
              <a href="tel:5551234567">(555) 123-4567</a>
            </div>
          </div>

          <div className="info-card-premium">
            <div className="info-icon-box"><MapPin size={24} /></div>
            <div className="info-content">
              <label>Estate Location</label>
              <p>1234 Grand Avenue,<br/>Los Angeles, CA 90015</p>
            </div>
          </div>
          
          <div className="contact-social-prompt">
            <label>Follow the Narrative</label>
            <div className="social-minimal">
              <a href="#/instagram">Instagram</a>
              <a href="#/twitter">Twitter</a>
              <a href="#/facebook">Facebook</a>
            </div>
          </div>
        </motion.div>

        {/* Right: Contact Form */}
        <motion.div 
          className="contact-form-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="premium-maestro-form">
            <div className="input-group-row">
              <div className="maestro-input-wrapper">
                <label>Identify Yourself</label>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="maestro-input-wrapper">
                <label>Response Path</label>
                <input 
                  type="email" 
                  placeholder="email@example.com" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
            </div>

            <div className="maestro-input-wrapper full-width">
              <label>The Narrative</label>
              <textarea 
                rows="6" 
                placeholder="How may we serve you tonight?" 
                required 
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" className="maestro-submit-btn" disabled={status === 'sending'}>
              <span className="btn-text">
                {status === 'sending' ? 'Transmitting...' : status === 'success' ? 'Transmission Successful' : 'Initialize Contact'}
              </span>
              <ArrowRight size={18} className="btn-icon" />
            </button>

            <AnimatePresence>
              {status === 'success' && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="form-feedback success"
                >
                  Your message has been encrypted and delivered to the Maestro.
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="form-feedback error"
                >
                  Connectivity failed. Please attempt a secondary transmission.
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </section>

    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterStatus('sending');
    fetch(`${API_BASE}/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newsletterEmail })
    })
    .then(() => {
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus(''), 5000);
    })
    .catch(() => setNewsletterStatus('error'));
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      let newPage = 'home';
      
      if (hash.startsWith('#/menu')) newPage = 'menu';
      else if (hash.startsWith('#/events')) newPage = 'events';
      else if (hash.startsWith('#/blog')) newPage = 'blog';
      else if (hash.startsWith('#/contact')) newPage = 'contact';
      else if (hash === '#/' || hash === '') newPage = 'home';
      
      setIsMobileMenuOpen(false); // Close mobile menu first
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  useEffect(() => {
    // Re-initialize Resmio widget if it exists globally
    if (window.resmio && typeof window.resmio.init === 'function') {
      try {
        window.resmio.init('liquid-maestro');
      } catch (e) {
        console.warn('Resmio init skipped:', e);
      }
    }
  }, [currentPage]);

  return (
    <>
      <LiquidBackground />
      <header>
        <a href="#/" className="logo" style={{ textDecoration: 'none' }}>Liquid Maestro</a>
        
        {/* Mobile Toggle Button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          aria-label="Toggle Menu"
        >
          <div className={`burger ${isMobileMenuOpen ? 'open' : ''}`}></div>
        </button>

        <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#/" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <a href="#/menu" onClick={() => setIsMobileMenuOpen(false)}>Menu</a>
          <a href="#/events" onClick={() => setIsMobileMenuOpen(false)}>Events</a>
          <a href="#/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</a>
          <a href="#/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          <a 
            href="#/reservations" 
            className="nav-reservation-btn resmio-button mobile-hidden"
            data-resmio-id="liquid-maestro"
          >
            <Calendar size={14} style={{ marginRight: '0.5rem' }} />
            Reservations
          </a>
        </nav>
      </header>

      <main style={{ minHeight: '80vh' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {currentPage === 'home' && <Home />}
            {currentPage === 'menu' && <MenuPage />}
            {currentPage === 'events' && <EventsPage />}
            {currentPage === 'blog' && <BlogPage />}
            {currentPage === 'contact' && <ContactPage />}
          </motion.div>
        </AnimatePresence>
      </main>


      {/* --- Footer (Expanded & Professional) --- */}
      <footer className="footer-expanded">
        <div className="footer-top container">
          <div className="footer-map">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.715220360341!2d-118.25622142340537!3d34.05118717315714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c7b398864757%3A0xe5f9922e3ea86d63!2sDowntown%20Los%20Angeles%2C%20Los%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1703248310023!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Liquid Maestro Location Map"
            ></iframe>
          </div>
          
          <div className="footer-details">
            <div className="footer-brand">
              <div className="logo" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>LIQUID MAESTRO</div>
              <p>Elevating the art of mixology in the heart of Los Angeles. Join our exclusive inner circle for seasonal tasting events and private party reservations.</p>
            </div>

            <div className="footer-newsletter">
              <h4>Newsletter</h4>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  required 
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                />
                <button type="submit" disabled={newsletterStatus === 'sending'}>
                   {newsletterStatus === 'sending' ? '...' : newsletterStatus === 'success' ? '✓' : 'Submit'}
                </button>
              </form>
              {newsletterStatus === 'error' && <p style={{fontSize:'0.7rem', color:'var(--accent-color)', marginTop:'0.5rem'}}>Error. Please retry.</p>}
            </div>

            <div className="footer-contact-icons">
              <div className="footer-contact">
                <p>1234 Grand Avenue</p>
                <p>Los Angeles, CA 90015</p>
                <p style={{ marginTop: '1rem' }}><a href="mailto:info@liquidmaestro.com">info@liquidmaestro.com</a></p>
                <p><a href="tel:5551234567">(555) 123-4567</a></p>
              </div>
              
              <div className="social-icons">
                <a href="https://instagram.com/liquidmaestro" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://twitter.com/liquidmaestro" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
                <a href="https://facebook.com/liquidmaestro" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom container">
          <div className="footer-bottom-links">
            <a href="#/privacy">Privacy Policy</a>
            <a href="#/terms">Terms of Service</a>
          </div>
          <div>
            &copy; 2026 Liquid Maestro. All rights reserved.
          </div>
        </div>
      </footer>

    </>
  );
}

export default App;
