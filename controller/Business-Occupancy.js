import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import BusinessOccupancy from '../models/Business-occupancy.js';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Email transporter verification failed:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const getEmailTemplate = (status, permitData) => {
  const { owner_establishment, control_no, location } = permitData;

  switch (status) {
    case 'approved':
      return {
        subject: 'Business & Occupancy Permit Approved - Control No: ' + control_no,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">🎉 Business & Occupancy Permit Approved!</h2>
            <p>Dear ${owner_establishment},</p>
            <p>We are pleased to inform you that your business and occupancy permit application has been <strong style="color: #28a745;">APPROVED</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
              <h3>Permit Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Control Number:</strong> ${control_no}</li>
                <li><strong>Business Owner:</strong> ${owner_establishment}</li>
                <li><strong>Location:</strong> ${location}</li>
                <li><strong>Status:</strong> <span style="color: #28a745;">Approved</span></li>
              </ul>
            </div>
            <p>You can now proceed with your business operations and occupancy. Please keep this permit information for your records.</p>
            <p>Thank you for your compliance with local business and occupancy regulations.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      };
    case 'rejected':
      return {
        subject: 'Business & Occupancy Permit Application Update - Control No: ' + control_no,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">❌ Business & Occupancy Permit Application Update</h2>
            <p>Dear ${owner_establishment},</p>
            <p>We regret to inform you that your business and occupancy permit application has been <strong style="color: #dc3545;">REJECTED</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #dc3545; margin: 20px 0;">
              <h3>Application Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Control Number:</strong> ${control_no}</li>
                <li><strong>Business Owner:</strong> ${owner_establishment}</li>
                <li><strong>Location:</strong> ${location}</li>
                <li><strong>Status:</strong> <span style="color: #dc3545;">Rejected</span></li>
              </ul>
            </div>
            <p>Please contact our office for more information about the reasons for rejection and the steps needed to resubmit your application.</p>
            <p>We appreciate your understanding and look forward to assisting you further.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      };
    default:
      return {
        subject: 'Business & Occupancy Permit Status Update - Control No: ' + control_no,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ffc107;">📋 Business & Occupancy Permit Status Update</h2>
            <p>Dear ${owner_establishment},</p>
            <p>Your business and occupancy permit application status has been updated to: <strong style="color: #ffc107;">${status.toUpperCase()}</strong></p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3>Application Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Control Number:</strong> ${control_no}</li>
                <li><strong>Business Owner:</strong> ${owner_establishment}</li>
                <li><strong>Location:</strong> ${location}</li>
                <li><strong>Status:</strong> ${status}</li>
              </ul>
            </div>
            <p>We will keep you updated on any further changes to your application status.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      };
  }
};

const sendStatusEmail = async (userEmail, status, permitData) => {
  try {
    console.log(`Attempting to send email to: ${userEmail}`);
    console.log(`Email credentials - From: ${process.env.EMAIL_USER}`);
    
    const emailTemplate = getEmailTemplate(status, permitData);
    const mailOptions = {
      from: `"Fire Station Admin" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };
    
    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    console.log('Email sent from:', result.envelope.from);
    console.log('Email sent to:', result.envelope.to);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

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
      status,
      payment_status_business,
      last_payment_date_business,
      payment_status_occupancy,
      last_payment_date_occupancy
    } = req.body;

    if (!date_received || !owner_establishment || !location || !control_no) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const existingPermit = await BusinessOccupancy.findOne({
      owner_establishment,
      location,
      control_no
    });

    if (existingPermit) {
      return res.status(409).json({ message: "Business & Occupancy permit already exists", success: false });
    }

    const newPermit = new BusinessOccupancy({
      user: req.user.id,
      date_received,
      owner_establishment,
      location,
      fcode_fee,
      or_no,
      evaluated_by,
      date_released_fsec,
      control_no,
      status: status || 'pending',
      payment_status_business: payment_status_business || 'not_paid',
      last_payment_date_business: last_payment_date_business || null,
      payment_status_occupancy: payment_status_occupancy || 'not_paid',
      last_payment_date_occupancy: last_payment_date_occupancy || null
    });

    await newPermit.save();

    res.status(201).json({ message: "Business & Occupancy permit created successfully!", success: true });
  } catch (error) {
    console.error("CreatePermit Error:", error);
    res.status(500).json({ message: "Error creating permit", error: error.message });
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
      status,
      payment_status_business,
      last_payment_date_business,
      payment_status_occupancy,
      last_payment_date_occupancy
    } = req.body;

    if (!date_received || !owner_establishment || !location || !control_no) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const permit = await BusinessOccupancy.findById(id);

    if (!permit) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    permit.date_received = date_received;
    permit.owner_establishment = owner_establishment;
    permit.location = location;
    permit.fcode_fee = fcode_fee;
    permit.or_no = or_no;
    permit.evaluated_by = evaluated_by;
    permit.date_released_fsec = date_released_fsec;
    permit.control_no = control_no;

    if (status) {
      permit.status = status;
    }

    if (payment_status_business !== undefined) {
      permit.payment_status_business = payment_status_business;
    }

    if (last_payment_date_business !== undefined) {
      permit.last_payment_date_business = last_payment_date_business;
    }

    if (payment_status_occupancy !== undefined) {
      permit.payment_status_occupancy = payment_status_occupancy;
    }

    if (last_payment_date_occupancy !== undefined) {
      permit.last_payment_date_occupancy = last_payment_date_occupancy;
    }

    await permit.save();

    res.status(200).json({ message: "Permit updated successfully!", success: true });
  } catch (error) {
    console.error("UpdatePermit Error:", error);
    res.status(500).json({ message: "Error updating permit", error: error.message });
  }
};

export const UpdateBusinessPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status_business, last_payment_date_business } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    if (!payment_status_business || !['paid', 'not_paid'].includes(payment_status_business)) {
      return res.status(400).json({ message: "Invalid business payment status value", success: false });
    }

    const permit = await BusinessOccupancy.findById(id);

    if (!permit) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    permit.payment_status_business = payment_status_business;
    
    if (payment_status_business === 'paid' && last_payment_date_business) {
      permit.last_payment_date_business = last_payment_date_business;
    } else if (payment_status_business === 'not_paid') {
      permit.last_payment_date_business = null;
    }

    await permit.save();

    res.status(200).json({ 
      message: `Business payment status updated to ${payment_status_business}`, 
      success: true 
    });
  } catch (error) {
    console.error("UpdateBusinessPaymentStatus Error:", error);
    res.status(500).json({ message: "Error updating business payment status", error: error.message });
  }
};

export const UpdateOccupancyPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status_occupancy, last_payment_date_occupancy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    if (!payment_status_occupancy || !['paid', 'not_paid'].includes(payment_status_occupancy)) {
      return res.status(400).json({ message: "Invalid occupancy payment status value", success: false });
    }

    const permit = await BusinessOccupancy.findById(id);

    if (!permit) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    permit.payment_status_occupancy = payment_status_occupancy;
    
    if (payment_status_occupancy === 'paid' && last_payment_date_occupancy) {
      permit.last_payment_date_occupancy = last_payment_date_occupancy;
    } else if (payment_status_occupancy === 'not_paid') {
      permit.last_payment_date_occupancy = null;
    }

    await permit.save();

    res.status(200).json({ 
      message: `Occupancy payment status updated to ${payment_status_occupancy}`, 
      success: true 
    });
  } catch (error) {
    console.error("UpdateOccupancyPaymentStatus Error:", error);
    res.status(500).json({ message: "Error updating occupancy payment status", error: error.message });
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

    const permit = await BusinessOccupancy.findById(id).populate('user', 'email');

    if (!permit) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    console.log('Permit found:', {
      id: permit._id,
      owner: permit.owner_establishment,
      userEmail: permit.user?.email
    });

    permit.status = status;
    await permit.save();

    if (permit.user && permit.user.email) {
      console.log(`User email found: ${permit.user.email}`);
      
      const permitData = {
        owner_establishment: permit.owner_establishment,
        control_no: permit.control_no,
        location: permit.location
      };

      const emailResult = await sendStatusEmail(permit.user.email, status, permitData);
      
      if (emailResult.success) {
        console.log(`✅ Email notification sent successfully to ${permit.user.email} for status: ${status}`);
      } else {
        console.error(`❌ Failed to send email notification: ${emailResult.error}`);
      }
    } else {
      console.log('❌ No user email found - email notification skipped');
    }

    res.status(200).json({ 
      message: `Permit status updated to ${status}`, 
      success: true,
      emailSent: permit.user?.email ? true : false
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

    const result = await BusinessOccupancy.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    res.status(200).json({ message: "Permit deleted successfully!", success: true });
  } catch (error) {
    console.error("DeletePermit Error:", error);
    res.status(500).json({ message: "Error deleting permit", error: error.message });
  }
};

export const GetPermit = async (req, res) => {
  try {
    const permits = await BusinessOccupancy.find().populate("user");

    if (!permits || permits.length === 0) {
      return res.status(404).json({ message: "No permits found", success: false });
    }

    res.status(200).json({ permits, success: true });
  } catch (error) {
    console.error("GetPermit Error:", error);
    res.status(500).json({ message: "Error retrieving permits", error: error.message });
  }
};

export const GetPermitsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value", success: false });
    }
    
    const permits = await BusinessOccupancy.find({ status }).populate("user");
    
    if (!permits || permits.length === 0) {
      return res.status(404).json({ message: `No permits with status '${status}' found`, success: false });
    }
    
    res.status(200).json({ permits, success: true });
  } catch (error) {
    console.error("GetPermitsByStatus Error:", error);
    res.status(500).json({ message: "Error retrieving permits by status", error: error.message });
  }
};

export const GetPermitsByBusinessPaymentStatus = async (req, res) => {
  try {
    const { payment_status_business } = req.params;
    
    if (!payment_status_business || !['paid', 'not_paid'].includes(payment_status_business)) {
      return res.status(400).json({ message: "Invalid business payment status value", success: false });
    }
    
    const permits = await BusinessOccupancy.find({ payment_status_business }).populate("user");
    
    if (!permits || permits.length === 0) {
      return res.status(404).json({ message: `No permits with business payment status '${payment_status_business}' found`, success: false });
    }
    
    res.status(200).json({ permits, success: true });
  } catch (error) {
    console.error("GetPermitsByBusinessPaymentStatus Error:", error);
    res.status(500).json({ message: "Error retrieving permits by business payment status", error: error.message });
  }
};

export const GetPermitsByOccupancyPaymentStatus = async (req, res) => {
  try {
    const { payment_status_occupancy } = req.params;
    
    if (!payment_status_occupancy || !['paid', 'not_paid'].includes(payment_status_occupancy)) {
      return res.status(400).json({ message: "Invalid occupancy payment status value", success: false });
    }
    
    const permits = await BusinessOccupancy.find({ payment_status_occupancy }).populate("user");
    
    if (!permits || permits.length === 0) {
      return res.status(404).json({ message: `No permits with occupancy payment status '${payment_status_occupancy}' found`, success: false });
    }
    
    res.status(200).json({ permits, success: true });
  } catch (error) {
    console.error("GetPermitsByOccupancyPaymentStatus Error:", error);
    res.status(500).json({ message: "Error retrieving permits by occupancy payment status", error: error.message });
  }
};

export const SearchPermits = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required", success: false });
    }
    
    const searchPattern = new RegExp(query, 'i');
    
    const permits = await BusinessOccupancy.find({
      $or: [
        { owner_establishment: searchPattern },
        { location: searchPattern },
        { control_no: searchPattern },
        { evaluated_by: searchPattern },
        { or_no: searchPattern },
        { fcode_fee: searchPattern },
        { status: searchPattern },
        { payment_status_business: searchPattern },
        { payment_status_occupancy: searchPattern }
      ]
    }).populate("user");
    
    if (permits.length === 0) {
      return res.status(404).json({ message: "No matching permits found", success: false });
    }
    
    res.status(200).json({ permits, success: true });
  } catch (error) {
    console.error("SearchPermits Error:", error);
    res.status(500).json({ message: "Error searching permits", error: error.message });
  }
};