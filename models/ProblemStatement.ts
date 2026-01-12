import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProblemStatement extends Document {
  title: string;
  description: string;
  teamCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemStatementSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minlength: 10,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 1000,
    },
    teamCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ProblemStatementSchema.index({ createdAt: -1 });

const ProblemStatement: Model<IProblemStatement> =
  mongoose.models.ProblemStatement ||
  mongoose.model<IProblemStatement>("ProblemStatement", ProblemStatementSchema);

export default ProblemStatement;
