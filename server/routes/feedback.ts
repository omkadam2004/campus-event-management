import express from 'express';
import { getDb, ObjectId } from '../db.ts';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const toObjectId = (id: string) => new ObjectId(id);

router.post('/:eventId', verifyToken, async (req: any, res: any) => {
  const { eventId } = req.params;
  const { rating, comment } = req.body;

  try {
    const db = getDb();
    const registrations = db.collection('registrations');
    const feedback = db.collection('feedback');

    const registration = await registrations.findOne({
      event_id: toObjectId(eventId),
      student_id: toObjectId(req.user.id),
      attendance_status: 'present',
    });

    if (!registration) {
      return res.status(403).json({ message: 'You can only give feedback for events you attended' });
    }

    const existingFeedback = await feedback.findOne({
      event_id: toObjectId(eventId),
      student_id: toObjectId(req.user.id),
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted' });
    }

    await feedback.insertOne({
      event_id: toObjectId(eventId),
      student_id: toObjectId(req.user.id),
      rating,
      comment,
      created_at: new Date(),
    });

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:eventId', async (req: any, res: any) => {
  const { eventId } = req.params;

  try {
    const db = getDb();
    const feedback = db.collection('feedback');

    const feedbacks = await feedback.aggregate([
      { $match: { event_id: toObjectId(eventId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $addFields: { student: { $arrayElemAt: ['$student', 0] } } },
      {
        $project: {
          student: 0,
          student_name: '$student.name',
        },
      },
    ]).toArray();

    res.json(feedbacks.map((fb) => ({
      ...fb,
      id: fb._id.toString(),
      event_id: fb.event_id?.toString?.(),
      student_id: fb.student_id?.toString?.(),
    })));
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
