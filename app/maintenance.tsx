export default function MaintenancePage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0f1f3d; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .wrap { text-align: center; padding: 40px 24px; max-width: 520px; }
        .logo { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #c9a84c; margin-bottom: 40px; }
        .logo span { color: #fff; }
        .icon { font-size: 4rem; margin-bottom: 24px; animation: spin 3s linear infinite; display: inline-block; }
        @keyframes spin { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(10deg)} }
        h1 { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 5vw, 2.6rem); color: #fff; margin-bottom: 16px; line-height: 1.2; }
        h1 em { color: #c9a84c; font-style: normal; }
        p { color: rgba(255,255,255,0.6); font-size: 1rem; line-height: 1.7; margin-bottom: 32px; }
        .contact { display: flex; flex-direction: column; gap: 12px; align-items: center; }
        .contact a { color: #c9a84c; text-decoration: none; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; transition: opacity .2s; }
        .contact a:hover { opacity: 0.8; }
        .divider { width: 40px; height: 2px; background: rgba(201,168,76,0.3); margin: 32px auto; border-radius: 2px; }
        .langs { color: rgba(255,255,255,0.3); font-size: 0.8rem; }
      `}</style>
      <div className="wrap">
        <div className="logo"><span>Antrags</span>helfer<span>Pro</span></div>
        <div className="icon">🔧</div>
        <h1>Kurze <em>Wartungspause</em></h1>
        <p>
          Wir arbeiten gerade an Verbesserungen für Sie.<br/>
          Die Seite ist in Kürze wieder verfügbar.
        </p>
        <p style={{fontSize:'0.85rem', color:'rgba(255,255,255,0.4)'}}>
          Shërbimi do të jetë i disponueshëm së shpejti.<br/>
          We'll be back shortly.
        </p>
        <div className="divider" />
        <div className="contact">
          <a href="tel:+4917451560330">📞 +49 174 5156030</a>
          <a href="mailto:antragshelferpro@gmail.com">✉️ antragshelferpro@gmail.com</a>
          <a href="https://wa.me/4917451560330">💬 WhatsApp</a>
        </div>
      </div>
    </>
  )
}
