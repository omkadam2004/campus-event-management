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

router.get('/', verifyToken, async (req: any, res: any) => {
  try {
    const db = getDb();
    const notifications = db.collection('notifications');
    const items = await notifications
      .find({ user_id: toObjectId(req.user.id) })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    res.json(items.map((item) => ({
      ...item,
      id: item._id.toString(),
      user_id: item.user_id?.toString?.(),
    })));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/read-all', verifyToken, async (req: any, res: any) => {
  try {
    const db = getDb();
    const notifications = db.collection('notifications');
    await notifications.updateMany(
      { user_id: toObjectId(req.user.id) },
      { $set: { is_read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
