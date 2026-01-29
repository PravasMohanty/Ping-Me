const mongoose = require(`mongoose`)

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    admin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    headCount: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Group', GroupSchema)