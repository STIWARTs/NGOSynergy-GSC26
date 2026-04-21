import admin from 'firebase-admin'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env') })

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
}

if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
  console.error('Missing Firebase credentials in .env')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
})

const db = admin.firestore()

const INDIAN_CITIES = [
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
]

const CATEGORIES = ['Flood', 'Earthquake', 'Cyclone', 'Fire', 'Medical Emergency']
const SKILLS = ['First Aid', 'Search and Rescue', 'Water Rescue', 'Medical', 'Logistics', 'Driving']

async function seed() {
  console.log('Seeding Firestore with Indian data...')

  // 1. Create Global Config
  await db.collection('globalConfig').doc('ai_weights').set({
    a: 0.4, // skill match
    b: 0.3, // proximity
    c: 0.2, // reliability
    d: 0.1, // certification
    useVertexAI: false,
    endpointId: '',
  })
  console.log('Global config seeded.')

  // 2. Create Incidents
  for (let i = 1; i <= 10; i++) {
    const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)]
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    
    // Add some random displacement
    const lat = city.lat + (Math.random() - 0.5) * 0.1
    const lng = city.lng + (Math.random() - 0.5) * 0.1

    await db.collection('incidents').add({
      title: `${category} in ${city.name} - Case ${i}`,
      description: `Emergency ${category.toLowerCase()} reported near ${city.name}. Immediate assistance required.`,
      category,
      severity: Math.floor(Math.random() * 5) + 1,
      status: 'pending',
      coordinates: { lat, lng },
      location: city.name,
      photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=1000',
      urgencyScore: Math.floor(Math.random() * 100),
      timestamp: admin.firestore.Timestamp.now(),
      verified: false,
      geminiVerified: false,
      reporterName: `Field Agent ${String.fromCharCode(64 + i)}`,
      affectedCount: Math.floor(Math.random() * 500) + 1,
    })
  }
  console.log('10 Incidents seeded.')

  // 3. Create Volunteers
  for (let i = 1; i <= 30; i++) {
    const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)]
    
    // Distribute volunteers around cities
    const lat = city.lat + (Math.random() - 0.5) * 0.2
    const lng = city.lng + (Math.random() - 0.5) * 0.2

    const volunteerSkills = [
      SKILLS[Math.floor(Math.random() * SKILLS.length)],
      SKILLS[Math.floor(Math.random() * SKILLS.length)]
    ].filter((v, i, a) => a.indexOf(v) === i)

    await db.collection('volunteers').add({
      name: `Volunteer ${i}`,
      email: `volunteer${i}@example.com`,
      skills: volunteerSkills,
      status: 'active',
      currentCoordinates: { lat, lng },
      reliabilityScore: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      fcmToken: 'mock-fcm-token',
      certifications: Math.random() > 0.7 ? ['Pro Certified'] : [],
      pastDeployments: Math.floor(Math.random() * 10),
    })
  }
  console.log('30 Volunteers seeded.')

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
