import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { ExternalLink, Star } from 'lucide-react';

export default function Bio() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch featured links for the bio page
    const q = query(
      collection(db, "links"), 
      where("isFeatured", "==", true),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>Loading Top Picks...</div>;
  }

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Profile Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--amz-nav-bg)', 
            margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '2rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            AF
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '5px' }}>Aesthetic Finds</h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>My favorite picks and daily deals 👇</p>
        </div>

        {/* Links Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {links.length === 0 ? (
            <p style={{ color: '#888' }}>No featured items yet.</p>
          ) : (
            links.map(link => (
              <a 
                key={link.id} 
                href={`/link/${link.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '12px 15px', 
                  backgroundColor: '#fff', borderRadius: '12px', textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative', overflow: 'hidden'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
              >
                {/* Highlight Tab */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', backgroundColor: 'var(--amz-price)' }}></div>
                
                {/* Image Thumbnail */}
                {link.imageUrl && (
                  <div style={{ width: '60px', height: '60px', flexShrink: 0, marginRight: '15px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={link.imageUrl} alt={link.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                
                {/* Content */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Star size={14} fill="gold" color="gold" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--amz-price)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Pick</span>
                  </div>
                  <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#111', margin: 0, lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {link.title}
                  </h2>
                </div>
                
                {/* Icon */}
                <div style={{ marginLeft: '10px', color: '#ccc' }}>
                  <ExternalLink size={20} />
                </div>
              </a>
            ))
          )}
        </div>
        
        <div style={{ marginTop: '40px', fontSize: '0.85rem', color: '#aaa' }}>
          <a href="/" style={{ color: '#aaa', textDecoration: 'none' }}>View Full Storefront</a>
        </div>

      </div>
    </div>
  );
}
