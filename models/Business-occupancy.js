import mongoose from "mongoose";

const BusinessOccupancySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  date_received: {
    type: String,
    default: null
  },
  owner_establishment: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  fcode_fee: {
    type: String,
    default: null
  },
  or_no: {
    type: String,
    default: null
  },
  evaluated_by: {
    type: String,
    default: null
  },
  date_released_fsec: {
    type: String,
    default: null
  },
  control_no: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  payment_status_business: {
    type: String,
    enum: ['paid', 'not_paid'],
    default: 'not_paid'
  },
  last_payment_date_business: {
    type: String,
    default: null
  },
  payment_status_occupancy: {
    type: String,
    enum: ['paid', 'not_paid'],
    default: 'not_paid'
  },
  last_payment_date_occupancy: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const BusinessOccupancy = mongoose.model("BusinessOccupancy", BusinessOccupancySchema);

export default BusinessOccupancy;