import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { connectDb } from '../src/config/db.js';
import '../src/models/index.js';
import { User } from '../src/models/User.js';
import { Note } from '../src/models/Note.js';

if (process.platform === 'win32') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

await connectDb();

const sampleUser = await User.findOne({}).sort({ _id: 1 });
const userId = sampleUser?._id ?? new mongoose.Types.ObjectId();
const ownerId = sampleUser?._id ?? userId;

const queries = [
  {
    name: 'Login by email',
    run: () => User.find({ email: 'sample@example.com' }).explain('executionStats'),
  },
  {
    name: 'Scenario 1 match on interests',
    run: () =>
      User.aggregate([
        { $match: { interests: { $type: 'string' } } },
        { $limit: 1 },
      ]).explain('executionStats'),
  },
  {
    name: 'My notes list',
    run: () =>
      Note.find({ owner: ownerId })
        .sort({ _id: -1 })
        .limit(11)
        .explain('executionStats'),
  },
  {
    name: 'Scenario 2 lookup posts',
    run: () =>
      User.aggregate([
        { $match: { _id: userId } },
        { $project: { name: 1 } },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'author',
            pipeline: [{ $sort: { _id: -1 } }, { $limit: 11 }],
            as: 'posts',
          },
        },
      ]).explain('executionStats'),
  },
];

for (const q of queries) {
  console.log('\n===', q.name, '===');
  const plan = await q.run();
  console.log(JSON.stringify(plan, null, 2));
}

await mongoose.disconnect();
