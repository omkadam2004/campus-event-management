import express from 'express';
import { getDb, ObjectId } from '../db.ts';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { sendEmail } from '../utils/mailer.ts';

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
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can register for events' });
  }

  const { eventId } = req.params;
  const { wantsAccommodation } = req.body;

  try {
    const db = getDb();
    const events = db.collection('events');
    const registrations = db.collection('registrations');
    const users = db.collection('users');

    const event = await events.findOne({ _id: toObjectId(eventId) });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Event not approved yet' });
    }

    const registrationCount = await registrations.countDocuments({ event_id: event._id });
    if (registrationCount >= event.max_participants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const existingRegistration = await registrations.findOne({ event_id: event._id, student_id: toObjectId(req.user.id) });
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    const student = await users.findOne({ _id: toObjectId(req.user.id) });

    const rawData = {
      eventId,
      studentId: req.user.id,
      studentName: student?.name || 'Unknown Student',
      studentEmail: student?.email || 'Unknown Email',
      eventName: event.title,
      timestamp: new Date().toISOString(),
    };

    const qrData = `STUDENT PASS\n` +
      `Name: ${rawData.studentName}\n` +
      `Event: ${rawData.eventName}\n` +
      `Email: ${rawData.studentEmail}\n` +
      `--------------------\n` +
      `VERIFY_DATA:${JSON.stringify(rawData)}`;

    const qrCode = await QRCode.toDataURL(qrData);
    const accommodationCost = wantsAccommodation ? (event.accommodation_cost || 0) : 0;
    const totalPaid = (event.fee || 0) + accommodationCost;
    const paymentStatus = 'paid';

    await registrations.insertOne({
      event_id: event._id,
      student_id: toObjectId(req.user.id),
      registration_date: new Date(),
      attendance_status: 'absent',
      qr_code: qrCode,
      wants_accommodation: wantsAccommodation ? true : false,
      accommodation_cost: accommodationCost,
      total_paid: totalPaid,
      payment_status: paymentStatus,
    });

    if (student?.email) {
      await sendEmail({
        to: student.email,
        subject: `Registration Confirmed: ${event.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
            <h2 style="color: #10b981; margin-top: 0;">Registration Confirmed!</h2>
            <p>Hi ${student.name || 'there'},</p>
            <p>You have successfully registered for <strong>"${event.title}"</strong>.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${event.date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${event.time}</p>
              <p style="margin: 5px 0;"><strong>Venue:</strong> ${event.venue}</p>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${event.event_type}</p>
            </div>
            <p>Your registration is complete. You can access your entry QR code in the app's "My Registrations" section.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #64748b; font-size: 12px;">This is an automated confirmation from CampusEvent Pro.</p>
          </div>
        `,
      });
    }

    res.status(201).json({ message: 'Registration successful', qrCode });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my', verifyToken, async (req: any, res: any) => {
  try {
    const db = getDb();
    const registrations = db.collection('registrations');

    const regs = await registrations.aggregate([
      { $match: { student_id: toObjectId(req.user.id) } },
      {
        $lookup: {
          from: 'events',
          localField: 'event_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      {
        $lookup: {
          from: 'users',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $project: {
          registration_date: 1,
          attendance_status: 1,
          qr_code: 1,
          wants_accommodation: 1,
          accommodation_cost: 1,
          total_paid: 1,
          payment_status: 1,
          event_id: '$event._id',
          title: '$event.title',
          date: '$event.date',
          time: '$event.time',
          venue: '$event.venue',
          poster_url: '$event.poster_url',
          student_name: '$student.name',
          student_email: '$student.email',
        },
      },
      { $sort: { registration_date: -1 } },
    ]).toArray();

    res.json(regs.map((reg) => ({
      ...reg,
      id: reg._id.toString(),
      student_id: reg.student_id?.toString?.(),
      event_id: reg.event_id?.toString?.(),
    })));
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/attendance', verifyToken, async (req: any, res: any) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only organizers can mark attendance' });
  }

  const { status } = req.body;
  const { id } = req.params;

  try {
    const db = getDb();
    const registrations = db.collection('registrations');
    await registrations.updateOne({ _id: toObjectId(id) }, { $set: { attendance_status: status } });

    res.json({ message: `Attendance marked as ${status}` });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
