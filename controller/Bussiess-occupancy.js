import mongoose from 'mongoose';
import Business from '../models/Business-occupancy.js';

export const CreatePermit = async (req, res) => {
  try {
    const {
      date_received,
      owner_establishment,
      location,
      fcode_fee,
      or_no,
      evaluated_by,
      date_released_fsec,
      control_no,
      status
    } = req.body;

    if (!date_received || !owner_establishment || !location || !control_no) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const existingBusiness = await Business.findOne({
      owner_establishment,
      location,
      control_no
    });

    if (existingBusiness) {
      return res.status(409).json({ message: "Business permit already exists", success: false });
    }

    const newBusiness = new Business({
      date_received,
      owner_establishment,
      location,
      fcode_fee,
      or_no,
      evaluated_by,
      date_released_fsec,
      control_no,
      status: status || 'pending' 
    });

    await newBusiness.save();

    res.status(201).json({ message: "Business permit created successfully!", success: true });
  } catch (error) {
    console.error("CreatePermit Error:", error);
    res.status(500).json({ message: "Error creating business permit", error: error.message });
  }
};

export const UpdatePermit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    const {
      date_received,
      owner_establishment,
      location,
      fcode_fee,
      or_no,
      evaluated_by,
      date_released_fsec,
      control_no,
      status
    } = req.body;

    if (!date_received || !owner_establishment || !location || !control_no) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business permit not found", success: false });
    }

    business.date_received = date_received;
    business.owner_establishment = owner_establishment;
    business.location = location;
    business.fcode_fee = fcode_fee;
    business.or_no = or_no;
    business.evaluated_by = evaluated_by;
    business.date_released_fsec = date_released_fsec;
    business.control_no = control_no;
    
 
    if (status) {
      business.status = status;
    }

    await business.save();

    res.status(200).json({ message: "Business permit updated successfully!", success: true });
  } catch (error) {
    console.error("UpdatePermit Error:", error);
    res.status(500).json({ message: "Error updating business permit", error: error.message });
  }
};

export const UpdateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value", success: false });
    }

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business permit not found", success: false });
    }

    business.status = status;
    await business.save();

    res.status(200).json({ 
      message: `Business permit status updated to ${status}`, 
      success: true 
    });
  } catch (error) {
    console.error("UpdateStatus Error:", error);
    res.status(500).json({ message: "Error updating permit status", error: error.message });
  }
};

export const DeletePermit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    const result = await Business.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Business permit not found", success: false });
    }

    res.status(200).json({ message: "Business permit deleted successfully!", success: true });
  } catch (error) {
    console.error("DeletePermit Error:", error);
    res.status(500).json({ message: "Error deleting business permit", error: error.message });
  }
};

export const GetPermit = async (req, res) => {
  try {
    const businesses = await Business.find();

    if (!businesses || businesses.length === 0) {
      return res.status(404).json({ message: "No business permits found", success: false });
    }

    res.status(200).json({ businesses, success: true });
  } catch (error) {
    console.error("GetPermit Error:", error);
    res.status(500).json({ message: "Error retrieving business permits", error: error.message });
  }
};

export const GetPermitsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value", success: false });
    }
    
    const businesses = await Business.find({ status });
    
    if (!businesses || businesses.length === 0) {
      return res.status(404).json({ message: `No business permits with status '${status}' found`, success: false });
    }
    
    res.status(200).json({ businesses, success: true });
  } catch (error) {
    console.error("GetPermitsByStatus Error:", error);
    res.status(500).json({ message: "Error retrieving business permits by status", error: error.message });
  }
};

export const SearchPermits = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required", success: false });
    }
    
    const searchPattern = new RegExp(query, 'i');
    
    const businesses = await Business.find({
      $or: [
        { owner_establishment: searchPattern },
        { location: searchPattern },
        { control_no: searchPattern },
        { evaluated_by: searchPattern },
        { or_no: searchPattern },
        { fcode_fee: searchPattern },
        { status: searchPattern }
      ]
    });
    
    if (businesses.length === 0) {
      return res.status(404).json({ message: "No matching business permits found", success: false });
    }
    
    res.status(200).json({ businesses, success: true });
  } catch (error) {
    console.error("SearchPermits Error:", error);
    res.status(500).json({ message: "Error searching business permits", error: error.message });
  }
};