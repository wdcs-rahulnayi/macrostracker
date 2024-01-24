const mongoose = require('mongoose');

const MacroSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    meals: [
      {
        name: {
          type: String,
          enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
          required: true
        },
        protein: {
          type: Number,
          required: true,
        },
        carbs: {
          type: Number,
          required: true,
        },
        fats: {
          type: Number,
          required: true,
        },
        fibres: {
          type: Number,
          required: true,
        },
        calories: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Ensure that there is only one entry for each meal type on a given date and for a specific user
MacroSchema.index({ date: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Macro', MacroSchema);
