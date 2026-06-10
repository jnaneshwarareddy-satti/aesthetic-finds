import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBq0LjdCOXHBrH0EHSrW5drAjiVVaVPASg",
  authDomain: "bhargav-reddy-c7ff1.firebaseapp.com",
  projectId: "bhargav-reddy-c7ff1",
  storageBucket: "bhargav-reddy-c7ff1.firebasestorage.app",
  messagingSenderId: "1057897789900",
  appId: "1:1057897789900:web:a020e3502783bc28f28569",
  measurementId: "G-1VXFQZG3VV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dummyProducts = [
  { title: "Wireless Noise Cancelling Headphones", price: "299.99", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" },
  { title: "Ergonomic Office Chair with Lumbar Support", price: "159.50", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500" },
  { title: "4K Ultra HD Smart Monitor 32-inch", price: "349.00", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500" },
  { title: "Mechanical Gaming Keyboard RGB", price: "89.99", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500" },
  { title: "Wireless Gaming Mouse ultra-lightweight", price: "49.99", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1527814050087-379381547994?w=500" },
  { title: "Professional USB Condenser Microphone", price: "129.00", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500" },
  { title: "1080p HD Webcam with Privacy Cover", price: "35.50", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1620021481515-5381f1fc8fc3?w=500" },
  { title: "Adjustable Laptop Stand Aluminum", price: "24.99", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1611078449940-101150c2d334?w=500" },
  { title: "Dual Monitor Desk Mount Arm", price: "45.00", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500" },
  { title: "100W USB-C Fast Charger GaN", price: "39.99", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500" },
  { title: "Braided USB-C to USB-C Cable 6ft", price: "14.99", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1598331668826-20cecb598181?w=500" },
  { title: "Portable SSD 1TB USB 3.2", price: "99.99", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1597463053702-863df774d06a?w=500" },
  { title: "Smart Home Security Camera Indoor", price: "45.99", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1557322984-e68981452933?w=500" },
  { title: "Bluetooth Portable Speaker Waterproof", price: "59.00", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500" },
  { title: "Fitness Tracker Smartwatch with Heart Rate", price: "79.50", url: "https://amazon.com", imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500" }
];

async function seed() {
  console.log("Seeding started...");
  for (let i = 0; i < dummyProducts.length; i++) {
    const prod = dummyProducts[i];
    const autoId = Math.random().toString(36).substring(2, 8).toUpperCase();
    await setDoc(doc(db, "links", autoId), {
      title: prod.title,
      url: prod.url,
      imageUrl: prod.imageUrl,
      price: prod.price,
      // Stagger creation dates slightly so they order nicely
      createdAt: new Date(Date.now() - i * 1000).toISOString()
    });
    console.log(`Added ${prod.title}`);
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
