import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' },
  },
  { timestamps: true },
);

noteSchema.index({ owner: 1, _id: -1 });

export const Note = mongoose.model('Note', noteSchema);
