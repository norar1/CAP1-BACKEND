import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
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
  }
});

const Business = mongoose.model('Business', BusinessSchema);

export default Business;