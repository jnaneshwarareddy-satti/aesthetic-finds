import { useState, useEffect } from 'react';
import { Plus, Trash2, LogOut, LayoutDashboard, Image as ImageIcon, MousePointerClick, Star, Search, TrendingUp, Edit2, X } from 'lucide-react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, onSnapshot, query, orderBy, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORIES = ["General", "Electronics", "Desk Setup", "Home", "Fashion"];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  const [links, setLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [newLink, setNewLink] = useState({ 
    title: '', 
    url: '', 
    imageUrl: '', 
    price: '',
    category: 'General',
    isFeatured: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const q = query(collection(db, "links"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }, (error) => {
      console.error("Error fetching links:", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError('Failed to sign in. Please check your credentials.');
    }
  };

  const handleLogout = () => signOut(auth);

  const generateShortId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleAddOrUpdateLink = async (e) => {
    e.preventDefault();
    if (newLink.title && newLink.url) {
      try {
        if (editingId) {
          // Update existing
          const docRef = doc(db, "links", editingId);
          await updateDoc(docRef, {
            title: newLink.title,
            url: newLink.url,
            imageUrl: newLink.imageUrl || null,
            price: newLink.price || '0.00',
            category: newLink.category || 'General',
            isFeatured: newLink.isFeatured || false,
          });
        } else {
          // Add new
          const autoId = generateShortId();
          await setDoc(doc(db, "links", autoId), {
            title: newLink.title,
            url: newLink.url,
            imageUrl: newLink.imageUrl || null,
            price: newLink.price || '0.00',
            category: newLink.category || 'General',
            isFeatured: newLink.isFeatured || false,
            clicks: 0,
            dailyClicks: {},
            createdAt: new Date().toISOString()
          });
        }
        
        // Reset form
        setEditingId(null);
        setNewLink({ title: '', url: '', imageUrl: '', price: '', category: 'General', isFeatured: false });
      } catch (error) {
        console.error("Error saving document: ", error);
        alert("Failed to save link. Make sure Firestore rules allow writing.");
      }
    }
  };

  const handleEdit = (link) => {
    setEditingId(link.id);
    setNewLink({
      title: link.title || '',
      url: link.url || '',
      imageUrl: link.imageUrl || '',
      price: link.price || '',
      category: link.category || 'General',
      isFeatured: link.isFeatured || false,
    });
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewLink({ title: '', url: '', imageUrl: '', price: '', category: 'General', isFeatured: false });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "links", id));
        if (editingId === id) {
          handleCancelEdit();
        }
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    link.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Show 8 items per page in admin to save vertical space
  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLinks.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Analytics Chart Logic
  const generateChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let clicksOnDate = 0;
      links.forEach(link => {
        if (link.dailyClicks && link.dailyClicks[dateStr]) {
          clicksOnDate += link.dailyClicks[dateStr];
        }
      });
      data.push({ name: shortDate, Clicks: clicksOnDate });
    }
    return data;
  };
  const chartData = generateChartData();

  if (isAuthChecking) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#fff' }}>
        <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <LayoutDashboard size={40} color="var(--amz-nav-bg)" style={{ marginBottom: '10px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '400' }}>Admin Sign-In</h2>
          </div>
          
          {authError && (
            <div style={{ padding: '1rem', border: '1px solid #c40000', color: '#c40000', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Email</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Password</label>
              <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f2f2f2' }}>
      <header style={{ backgroundColor: 'var(--amz-nav-bg)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ffa41c' }}>
          <LayoutDashboard size={24} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffa41c' }}>Seller Central Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={handleLogout} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid #565959' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        
        {/* Store Performance Graph */}
        <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '400' }}>
            <TrendingUp size={20} color="#007185" /> Store Performance (Last 7 Days)
          </h3>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="Clicks" fill="#007185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-grid">
          {/* Add/Edit Product Form */}
          <div className="card" style={{ padding: '20px', height: 'fit-content', border: editingId ? '2px solid #007185' : '1px solid var(--amz-border)' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '400', color: editingId ? '#007185' : 'inherit' }}>
              {editingId ? <><Edit2 size={20} /> Edit Product</> : <><Plus size={20} /> Add New Product</>}
            </h3>
            <form onSubmit={handleAddOrUpdateLink} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Product Title</label>
                <input type="text" className="input-field" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} required />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Price (₹)</label>
                  <input type="text" className="input-field" value={newLink.price} onChange={e => setNewLink({...newLink, price: e.target.value})} placeholder="e.g. 1999" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Category</label>
                  <select className="input-field" value={newLink.category} onChange={e => setNewLink({...newLink, category: e.target.value})} style={{ cursor: 'pointer' }}>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Target Affiliate URL</label>
                <input type="url" className="input-field" value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Image URL</label>
                <input type="url" className="input-field" value={newLink.imageUrl} onChange={e => setNewLink({...newLink, imageUrl: e.target.value})} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#fdf7f4', border: '1px solid #fcd200', borderRadius: '4px' }}>
                <input type="checkbox" id="isFeatured" checked={newLink.isFeatured} onChange={e => setNewLink({...newLink, isFeatured: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="isFeatured" style={{ fontSize: '0.95rem', cursor: 'pointer', fontWeight: 'bold' }}>Mark as "Top Pick" (Featured Badge)</label>
              </div>

              {newLink.imageUrl && (
                <div style={{ marginTop: '10px', border: '1px solid #d5d9d9', height: '100px', textAlign: 'center' }}>
                  <img src={newLink.imageUrl} alt="Preview" style={{ height: '100%', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Inventory List */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', fontWeight: '400', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span>Manage Inventory ({links.length})</span>
              <span style={{ fontSize: '0.9rem', color: '#565959' }}>Total Clicks: {links.reduce((acc, curr) => acc + (curr.clicks || 0), 0)}</span>
            </h3>

            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888C8C' }} size={18} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search products by title or ID..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: '35px' }}
              />
            </div>

            <div style={{ marginBottom: '15px', fontSize: '0.85rem', color: '#565959' }}>
              {filteredLinks.length > 0 ? `Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredLinks.length)} of ${filteredLinks.length} results` : ''}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {currentItems.map(link => (
                <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: editingId === link.id ? '2px solid #007185' : '1px solid #d5d9d9', borderRadius: '4px', backgroundColor: editingId === link.id ? '#f2fbff' : '#fff', position: 'relative', flexWrap: 'wrap', gap: '15px' }}>
                  
                  {link.isFeatured && (
                    <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--amz-nav-bg)', color: 'white', padding: '2px 8px', fontSize: '0.7rem', borderRadius: '0 4px 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={10} fill="gold" color="gold" /> Top Pick
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '200px' }}>
                    {link.imageUrl ? (
                      <img src={link.imageUrl} alt={link.title} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', backgroundColor: '#f2f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={24} color="#888" />
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontWeight: '400', fontSize: '1.1rem', marginBottom: '4px', color: 'var(--amz-link)' }}>{link.title}</h4>
                      <div style={{ fontSize: '0.9rem', color: '#565959', marginBottom: '4px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <span>Price: <strong style={{ color: '#B12704' }}>₹{link.price || '0.00'}</strong></span>
                        <span style={{ backgroundColor: '#f2f2f2', padding: '0 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{link.category || 'General'}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#565959' }}>
                        ID: <strong>{link.id}</strong> | <a href={link.url} target="_blank" rel="noreferrer" style={{ color: 'var(--amz-link)', textDecoration: 'none' }}>Test Link ↗</a>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#e7f4f5', color: '#007185', padding: '4px 10px', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      <MousePointerClick size={16} /> {link.clicks || 0} Clicks
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEdit(link)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="btn btn-secondary" style={{ color: '#B12704', padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                </div>
              ))}
              {filteredLinks.length === 0 && (
                <p style={{ color: '#565959', textAlign: 'center', padding: '40px 0' }}>No products match your search.</p>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '5px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ borderRadius: '4px', padding: '6px 10px', fontSize: '0.85rem' }}
                >
                  &lt; Prev
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button 
                    key={index} 
                    onClick={() => paginate(index + 1)}
                    style={{
                      padding: '6px 12px',
                      border: currentPage === index + 1 ? '1px solid var(--amz-price)' : '1px solid var(--amz-border)',
                      backgroundColor: currentPage === index + 1 ? '#fdf7f4' : '#fff',
                      color: currentPage === index + 1 ? 'var(--amz-price)' : 'var(--amz-text-main)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '0.85rem'
                    }}
                  >
                    {index + 1}
                  </button>
                ))}

                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ borderRadius: '4px', padding: '6px 10px', fontSize: '0.85rem' }}
                >
                  Next &gt;
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
