import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDeck extends Document {
  user: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeckSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` field before saving
DeckSchema.pre<IDeck>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IDeck>('Deck', DeckSchema);