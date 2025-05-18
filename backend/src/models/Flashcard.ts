import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFlashcard extends Document {
  deck: Types.ObjectId;
  user: Types.ObjectId;
  front: string;
  back: string;
  // Fields for spaced repetition algorithm
  interval: number; // in days
  repetition: number;
  efactor: number; // easiness factor
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema: Schema = new Schema({
  deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // To ensure user owns the flashcard
  front: { type: String, required: true },
  back: { type: String, required: true },
  interval: { type: Number, default: 0 },
  repetition: { type: Number, default: 0 },
  efactor: { type: Number, default: 2.5 },
  dueDate: { type: Date, default: Date.now }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  collection: 'Flashcards' // Explicitly set the collection name here
});

// Middleware to update `updatedAt` field before saving
FlashcardSchema.pre('save', function(this: IFlashcard, next: Function) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);