import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const docRef = doc(db, "links", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.url) {
            // Track the click!
            try {
              const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
              await setDoc(docRef, {
                clicks: increment(1),
                dailyClicks: {
                  [today]: increment(1)
                }
              }, { merge: true });
            } catch (trackErr) {
              console.error("Failed to track click, but proceeding to redirect", trackErr);
            }
            
            // Redirect user
            window.location.href = data.url;
          } else {
            setError("Invalid link configured.");
          }
        } else {
          setError("Link not found.");
        }
      } catch (err) {
        console.error("Error fetching link:", err);
        setError("Error connecting to database. Please check Firebase config.");
      }
    };

    fetchAndRedirect();
  }, [id]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #c40000', color: '#c40000', padding: '1.5rem', borderRadius: '4px', maxWidth: '400px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Oops!</h2>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', backgroundColor: 'var(--amz-bg)' }}>
      <Loader2 size={48} color="#e77600" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      <h2 style={{ color: 'var(--amz-text-main)', fontWeight: '400' }}>Taking you to the product...</h2>
      <p style={{ color: 'var(--amz-text-muted)' }}>Please wait a moment.</p>
    </div>
  );
}
