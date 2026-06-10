import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, ShoppingCart, Star } from 'lucide-react';

const CATEGORIES = ["All", "General", "Electronics", "Desk Setup", "Home", "Fashion"];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const q = query(collection(db, "links"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLinks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLinks(fetchedLinks);
      setLoading(false);
    }, (err) => {
      console.error("Firebase fetch failed", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and Sort Logic
  let processedLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          link.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'price_asc') {
    processedLinks.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
  } else if (sortBy === 'price_desc') {
    processedLinks.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
  }
  // If 'newest', it's already sorted by the Firebase query

  // Pagination logic
  const totalPages = Math.ceil(processedLinks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedLinks.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ backgroundColor: 'var(--amz-bg)', minHeight: '100vh', paddingBottom: '2rem' }}>
      {/* Amazon-style Header */}
      <header style={{ backgroundColor: 'var(--amz-nav-bg)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap' }}>
        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => {setSelectedCategory('All'); setSearchTerm('');}}>
          <ShoppingCart size={28} /> Aesthetic Finds
        </div>
        
        <div style={{ flex: '1 1 300px', display: 'flex', maxWidth: '800px', order: window.innerWidth < 768 ? 3 : 0 }}>
          <select 
            className="desktop-only"
            style={{ padding: '0 10px', backgroundColor: '#f3f3f3', border: 'none', borderRight: '1px solid #ccc', borderRadius: '4px 0 0 4px', cursor: 'pointer' }}
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Search products or IDs..." 
            style={{ flex: 1, padding: '10px 15px', border: 'none', borderRadius: window.innerWidth < 768 ? '4px 0 0 4px' : '0', fontSize: '1rem' }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
          <button style={{ backgroundColor: '#febd69', border: 'none', padding: '0 20px', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>
            <Search size={20} color="#111" style={{ display: 'block' }} />
          </button>
        </div>
        
        <div style={{ color: 'white', fontSize: '0.9rem', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          <a href="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin Login</a>
        </div>
      </header>

      {/* Subnav (Scrollable on mobile) */}
      <div className="hide-scrollbar" style={{ backgroundColor: 'var(--amz-nav-sub)', color: 'white', padding: '10px 20px', fontSize: '0.95rem', display: 'flex', gap: '20px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {CATEGORIES.map(cat => (
          <span 
            key={cat} 
            style={{ cursor: 'pointer', fontWeight: selectedCategory === cat ? 'bold' : 'normal', borderBottom: selectedCategory === cat ? '2px solid white' : 'none', paddingBottom: '2px' }}
            onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', display: 'flex', gap: '20px' }}>
        
        {/* Left Sidebar */}
        <div className="desktop-only" style={{ width: '250px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '15px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Categories</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {CATEGORIES.map(cat => (
                <li key={cat} style={{ marginBottom: '8px' }}>
                  <button 
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                    style={{ background: 'none', border: 'none', color: selectedCategory === cat ? '#e77600' : 'var(--amz-text-main)', fontWeight: selectedCategory === cat ? 'bold' : 'normal', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '0.95rem' }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Product Grid Area */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading products...</p>
          ) : (
            <>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '10px', backgroundColor: '#fff', border: '1px solid var(--amz-border)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.9rem' }}>
                  {processedLinks.length > 0 ? 
                    `Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, processedLinks.length)} of ${processedLinks.length} results` : 
                    'No results found'
                  }
                  {searchTerm && <span> for "<strong>{searchTerm}</strong>"</span>}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--amz-text-muted)' }}>Sort by:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid var(--amz-border)' }}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {currentItems.map(link => (
                  <div key={link.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                    
                    {link.isFeatured && (
                      <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'var(--amz-nav-bg)', color: 'white', padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px 0 4px 0', zIndex: 10, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Star size={12} fill="gold" color="gold" /> Top Pick
                      </div>
                    )}

                    <a href={`/link/${link.id}`} style={{ display: 'block', height: '200px', backgroundColor: '#f8f8f8', padding: '20px', textAlign: 'center' }}>
                      {link.imageUrl ? (
                        <img src={link.imageUrl} alt={link.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                          No Image
                        </div>
                      )}
                    </a>
                    
                    <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <a href={`/link/${link.id}`} style={{ textDecoration: 'none', color: 'var(--amz-link)', fontSize: '1.1rem', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {link.title}
                      </a>
                      
                      {/* Fake stars for Amazon feel */}
                      <div style={{ color: '#ffa41c', fontSize: '1rem', marginBottom: '8px' }}>
                        ★★★★☆ <span style={{ color: 'var(--amz-link)', fontSize: '0.8rem' }}>{Math.floor(Math.random() * 5000) + 100}</span>
                      </div>

                      <div style={{ fontSize: '1.5rem', color: 'var(--amz-price)', marginBottom: '4px' }}>
                        ₹{link.price || '0.00'}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--amz-text-muted)', marginBottom: '15px' }}>
                        Prime Delivery <br/>
                        ID: {link.id}
                      </div>
                      
                      <div style={{ marginTop: 'auto' }}>
                        <a href={`/link/${link.id}`} className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
                          View Deal
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', gap: '5px' }}>
                  <button 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                    style={{ borderRadius: '4px' }}
                  >
                    &lt; Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => paginate(index + 1)}
                      style={{
                        padding: '8px 14px',
                        border: currentPage === index + 1 ? '1px solid var(--amz-price)' : '1px solid var(--amz-border)',
                        backgroundColor: currentPage === index + 1 ? '#fdf7f4' : '#fff',
                        color: currentPage === index + 1 ? 'var(--amz-price)' : 'var(--amz-text-main)',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                    style={{ borderRadius: '4px' }}
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
