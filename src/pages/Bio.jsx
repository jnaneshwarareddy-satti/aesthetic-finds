import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ExternalLink, Star, Clock, Search } from 'lucide-react';

export default function Bio() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch the 30 most recent links. No need to filter by isFeatured anymore.
    // This ensures the latest product is ALWAYS at the top of the tree automatically.
    const q = query(
      collection(db, "links"), 
      orderBy("createdAt", "desc"),
      limit(30)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bio links: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLinks = links.filter(link => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      link.title.toLowerCase().includes(lowerSearch) || 
      link.id.toLowerCase().includes(lowerSearch)
    );
  });

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }} aria-live="polite">Loading Latest Picks...</div>;
  }

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <main style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Profile Header */}
        <header style={{ marginBottom: '20px' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--amz-nav-bg)', 
            margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '2rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }} aria-hidden="true">
            AF
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '5px' }}>Aesthetic Finds</h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Latest finds from my videos 👇</p>
        </header>

        {/* Search Bar */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search by name or ID (e.g. 5XY2)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 15px 12px 40px', 
              borderRadius: '100px', 
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
              outline: 'none',
              backgroundColor: '#fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
            }}
          />
          <Search size={18} color="#888" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Links Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} role="list">
          {filteredLinks.length === 0 ? (
            <p style={{ color: '#888' }} role="listitem">No items found.</p>
          ) : (
            filteredLinks.map((link, index) => (
              <a 
                key={link.id} 
                href={`/link/${link.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                role="listitem"
                aria-label={`View deal for ${link.title}`}
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
                {/* Highlight Tab for the absolute newest item (only show if not searching to avoid confusion) */}
                {index === 0 && !searchTerm && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', backgroundColor: '#e77600' }}></div>
                )}
                
                {/* Image Thumbnail */}
                {link.imageUrl ? (
                  <div style={{ width: '60px', height: '60px', flexShrink: 0, marginRight: '15px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={link.imageUrl} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                   <div style={{ width: '60px', height: '60px', flexShrink: 0, marginRight: '15px', borderRadius: '8px', backgroundColor: '#f0f0f0' }}></div>
                )}
                
                {/* Content */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {link.isFeatured ? (
                      <>
                        <Star size={14} fill="gold" color="gold" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--amz-price)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Pick</span>
                      </>
                    ) : (index === 0 && !searchTerm) ? (
                      <>
                        <Clock size={14} color="#e77600" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#e77600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Just Added</span>
                      </>
                    ) : null}
                  </div>
                  <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#111', margin: 0, lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {link.title}
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', fontWeight: '500', display: 'inline-block', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                    ID: {link.id}
                  </div>
                </div>
                
                {/* Icon */}
                <div style={{ marginLeft: '10px', color: '#ccc' }} aria-hidden="true">
                  <ExternalLink size={20} />
                </div>
              </a>
            ))
          )}
        </div>
        
        <footer style={{ marginTop: '40px', fontSize: '0.85rem', color: '#aaa' }}>
          <a href="/" style={{ color: '#aaa', textDecoration: 'none', padding: '10px' }} aria-label="View Full Storefront">View Full Storefront</a>
        </footer>

      </main>
    </div>
  );
}
