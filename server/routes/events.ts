import express from 'express';
import { getDb, ObjectId } from '../db.ts';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import { sendEmail } from '../utils/mailer.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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

const formatEvent = (event: any) => ({
  ...event,
  id: event._id.toString(),
  organizer_id: event.organizer_id?.toString?.() ?? event.organizer_id,
});

// Create event (Organizer only)
router.post('/', verifyToken, upload.single('poster'), async (req: any, res: any) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only organizers can create events' });
  }

  const { title, description, date, time, venue, category, max_participants, event_type, fee, accommodation_required, accommodation_cost } = req.body;
  const poster_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const db = getDb();
    const events = db.collection('events');
    const users = db.collection('users');
    const notifications = db.collection('notifications');

    const eventDoc = {
      title,
      description,
      date,
      time,
      venue,
      category,
      max_participants: parseInt(max_participants) || 0,
      poster_url,
      organizer_id: toObjectId(req.user.id),
      status: 'approved',
      event_type: event_type || 'Free',
      fee: parseFloat(fee) || 0,
      accommodation_required: accommodation_required === 'true' || accommodation_required === '1' || accommodation_required === 1,
      accommodation_cost: parseFloat(accommodation_cost) || 0,
      created_at: new Date(),
    };

    const result = await events.insertOne(eventDoc);
    const insertedEvent = await events.findOne({ _id: result.insertedId });

    const studentUsers = await users.find({ role: 'student' }).toArray();
    if (studentUsers.length > 0) {
      const notificationDocs = studentUsers.map((user) => ({
        user_id: user._id,
        message: `New event "${title}" is now open for registration!`,
        is_read: false,
        created_at: new Date(),
      }));
      await notifications.insertMany(notificationDocs);
    }

    const event = formatEvent(insertedEvent);

    if (req.io) {
      req.io.emit('event_published', event);
    }

    res.status(201).json(event);
  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events (Approved only for students, all for admin)
router.get('/', async (req: any, res: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  let user: any = null;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {}
  }

  try {
    const db = getDb();
    const events = db.collection('events');

    const match: any = {};
    if (user?.role === 'organizer') {
      match.$or = [
        { status: 'approved' },
        { organizer_id: toObjectId(user.id) },
      ];
    } else if (user?.role !== 'admin') {
      match.status = 'approved';
    }

    const results = await events.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'organizer_id',
          foreignField: '_id',
          as: 'organizer',
        },
      },
      { $addFields: { organizer_name: { $arrayElemAt: ['$organizer.name', 0] } } },
      { $project: { organizer: 0 } },
      { $sort: { _id: -1 } },
    ]).toArray();

    res.json(results.map((event) => ({
      ...event,
      id: event._id.toString(),
      organizer_id: event.organizer_id?.toString?.(),
    })));
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events with registrations (Admin/Organizer report data)
router.get('/reports/cumulative', verifyToken, async (req: any, res: any) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const db = getDb();
    const events = db.collection('events');
    const registrations = db.collection('registrations');

    const match: any = {};
    if (req.user.role === 'organizer') {
      match.organizer_id = toObjectId(req.user.id);
    }

    const eventDocs = await events.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'organizer_id',
          foreignField: '_id',
          as: 'organizer',
        },
      },
      { $addFields: { organizer_name: { $arrayElemAt: ['$organizer.name', 0] } } },
      { $project: { organizer: 0 } },
      { $sort: { date: -1 } },
    ]).toArray();

    const eventsWithRegs = await Promise.all(eventDocs.map(async (event) => {
      const regs = await registrations.aggregate([
        { $match: { event_id: event._id } },
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
            student_email: '$student.email',
          },
        },
      ]).toArray();

      return {
        ...event,
        id: event._id.toString(),
        organizer_id: event.organizer_id?.toString?.(),
        registrations: regs.map((reg) => ({
          ...reg,
          id: reg._id.toString(),
          event_id: reg.event_id?.toString?.(),
          student_id: reg.student_id?.toString?.(),
        })),
      };
    }));

    res.json(eventsWithRegs);
  } catch (error) {
    console.error('Reports cumulative error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject event (Admin only)
router.patch('/:id/status', verifyToken, async (req: any, res: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can approve/reject events' });
  }

  const { status } = req.body;
  const { id } = req.params;

  try {
    const db = getDb();
    const events = db.collection('events');
    const notifications = db.collection('notifications');

    await events.updateOne({ _id: toObjectId(id) }, { $set: { status } });

    const event = await events.findOne({ _id: toObjectId(id) });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const users = db.collection('users');
    const organizer = await users.findOne({ _id: event.organizer_id });

    if (organizer) {
      await notifications.insertOne({
        user_id: organizer._id,
        message: `Your event "${event.title}" has been ${status}.`,
        is_read: false,
        created_at: new Date(),
      });

      if (organizer.email) {
        await sendEmail({
          to: organizer.email,
          subject: `Event Status Update: ${event.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
              <h2 style="color: #0f172a; margin-top: 0;">Event Status Update</h2>
              <p>Hi ${organizer.name || 'there'},</p>
              <p>Your event <strong>"${event.title}"</strong> has been <strong>${status}</strong> by the administration.</p>
              ${status === 'approved' ? '<p>Your event is now live and students can begin registering!</p>' : '<p>Please contact admin for more details regarding this status update.</p>'}
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #64748b; font-size: 12px;">This is an automated notification from CampusEvent Pro.</p>
            </div>
          `,
        });
      }
    }

    res.json({ message: `Event ${status}` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel event (Organizer or Admin)
router.post('/:id/cancel', verifyToken, async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const db = getDb();
    const events = db.collection('events');
    const registrations = db.collection('registrations');
    const notifications = db.collection('notifications');
    const users = db.collection('users');

    const event = await events.findOne({ _id: toObjectId(id) });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && String(event.organizer_id) !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer or an admin can cancel this event' });
    }

    await events.updateOne({ _id: event._id }, { $set: { status: 'cancelled' } });

    const regs = await registrations.aggregate([
      { $match: { event_id: event._id } },
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
          _id: 1,
          student_id: 1,
          'student.name': 1,
          'student.email': 1,
        },
      },
    ]).toArray();

    for (const reg of regs) {
      await notifications.insertOne({
        user_id: reg.student_id,
        message: `The event "${event.title}" has been cancelled by the organizer.`,
        is_read: false,
        created_at: new Date(),
      });

      if (reg.student?.email) {
        await sendEmail({
          to: reg.student.email,
          subject: `Event Cancelled: ${event.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
              <h2 style="color: #ef4444; margin-top: 0;">Event Cancelled</h2>
              <p>Hi ${reg.student.name || 'there'},</p>
              <p>We are writing to inform you that the event <strong>"${event.title}"</strong> has been cancelled by the organizer.</p>
              <p>We apologize for any inconvenience this may cause.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #64748b; font-size: 12px;">This is an automated notification from CampusEvent Pro.</p>
            </div>
          `,
        });
      }
    }

    if (req.io) {
      req.io.emit('event_published', { ...event, status: 'cancelled', id: event._id.toString() });
    }

    res.json({ message: 'Event successfully cancelled' });
  } catch (error) {
    console.error('Cancel event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send reminders (Organizer or Admin)
router.post('/:id/reminder', verifyToken, async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const db = getDb();
    const events = db.collection('events');
    const registrations = db.collection('registrations');
    const notifications = db.collection('notifications');

    const event = await events.findOne({ _id: toObjectId(id) });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && String(event.organizer_id) !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer or an admin can send reminders' });
    }

    const regs = await registrations.aggregate([
      { $match: { event_id: event._id } },
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
          student_id: 1,
          'student.name': 1,
          'student.email': 1,
        },
      },
    ]).toArray();

    if (regs.length === 0) {
      return res.status(400).json({ message: 'No students registered for this event yet' });
    }

    for (const reg of regs) {
      await notifications.insertOne({
        user_id: reg.student_id,
        message: `Reminder: The event "${event.title}" is coming up on ${event.date} at ${event.time}. We look forward to seeing you at ${event.venue}!`,
        is_read: false,
        created_at: new Date(),
      });

      if (reg.student?.email) {
        await sendEmail({
          to: reg.student.email,
          subject: `Reminder: ${event.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
              <h2 style="color: #0f172a; margin-top: 0;">Event Reminder</h2>
              <p>Hi ${reg.student.name || 'there'},</p>
              <p>This is a friendly reminder that the event <strong>"${event.title}"</strong> is coming up soon!</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${event.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${event.time}</p>
                <p style="margin: 5px 0;"><strong>Venue:</strong> ${event.venue}</p>
              </div>
              <p>We look forward to seeing you there!</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #64748b; font-size: 12px;">This is an automated reminder from CampusEvent Pro.</p>
            </div>
          `,
        });
      }
    }

    res.json({ message: 'Reminders sent successfully to all registered students' });
  } catch (error) {
    console.error('Reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event details
router.get('/:id', async (req: any, res: any) => {
  try {
    const db = getDb();
    const events = db.collection('events');
    const registrations = db.collection('registrations');

    const event = await events.findOne({ _id: toObjectId(req.params.id) });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const regs = await registrations.aggregate([
      { $match: { event_id: event._id } },
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
          'student.password': 0,
          'student.created_at': 0,
          student_id: 0,
          event_id: 0,
        },
      },
    ]).toArray();

    res.json({
      ...formatEvent(event),
      registrations: regs.map((reg) => ({
        ...reg,
        id: reg._id.toString(),
        student_id: reg.student_id?.toString?.(),
        event_id: reg.event_id?.toString?.(),
      })),
    });
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
