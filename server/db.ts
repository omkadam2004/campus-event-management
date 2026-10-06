import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { MongoClient, Db, ObjectId } from 'mongodb';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'campusevent';

let db: Db;
let client: MongoClient;

export async function setupDatabase() {
  if (db) {
    return;
  }

  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);

  const users = db.collection('users');
  const events = db.collection('events');
  const registrations = db.collection('registrations');
  const feedback = db.collection('feedback');
  const notifications = db.collection('notifications');

  await users.createIndex({ email: 1 }, { unique: true });
  await registrations.createIndex({ event_id: 1, student_id: 1 }, { unique: true });
  await notifications.createIndex({ user_id: 1, created_at: -1 });
  await events.createIndex({ organizer_id: 1 });
  await feedback.createIndex({ event_id: 1, student_id: 1 });

  const existingUsers = await users.countDocuments();
  if (existingUsers === 0) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const seedUsers = [
      { name: 'Admin User', email: 'admin@college.edu', password: hashedPassword, role: 'admin', created_at: new Date() },
      { name: 'Faculty Organizer', email: 'organizer@college.edu', password: hashedPassword, role: 'organizer', created_at: new Date() },
      { name: 'Spark On Admin', email: 'sparkon@college.edu', password: hashedPassword, role: 'organizer', created_at: new Date() },
      { name: 'Student User', email: 'student@college.edu', password: hashedPassword, role: 'student', created_at: new Date() },
    ];

    const result = await users.insertMany(seedUsers);
    const organizerId = result.insertedIds[1];

    await events.insertMany([
      {
        title: 'Annual Tech Symposium',
        description: 'A grand gathering of tech enthusiasts featuring workshops on AI, Web3, and Cloud Computing.',
        date: '2026-05-15',
        time: '10:00',
        venue: 'Main Auditorium',
        category: 'Technical',
        max_participants: 200,
        poster_url: null,
        organizer_id: organizerId,
        status: 'approved',
        event_type: 'Free',
        fee: 0,
        accommodation_required: false,
        accommodation_cost: 0,
        created_at: new Date(),
      },
      {
        title: 'Cultural Night 2026',
        description: 'Experience the diversity of our campus through music, dance, and drama performances.',
        date: '2026-04-20',
        time: '18:00',
        venue: 'Open Air Theater',
        category: 'Cultural',
        max_participants: 500,
        poster_url: null,
        organizer_id: organizerId,
        status: 'approved',
        event_type: 'Free',
        fee: 0,
        accommodation_required: false,
        accommodation_cost: 0,
        created_at: new Date(),
      },
      {
        title: 'Inter-College Hackathon',
        description: '48 hours of non-stop coding to solve real-world problems. Prizes worth $5000!',
        date: '2026-06-10',
        time: '09:00',
        venue: 'Computer Lab 1',
        category: 'Technical',
        max_participants: 100,
        poster_url: null,
        organizer_id: organizerId,
        status: 'pending',
        event_type: 'Free',
        fee: 0,
        accommodation_required: false,
        accommodation_cost: 0,
        created_at: new Date(),
      },
    ]);
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database is not initialized. Call setupDatabase() first.');
  }
  return db;
}

export { ObjectId } from 'mongodb';
