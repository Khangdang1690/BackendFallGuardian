// Script to seed test users (patient and nurse) for SMS testing
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedTestUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // Create test nurse
    const testNurse = new User({
      name: 'Test Nurse',
      email: 'testnurse@fallguardian.com',
      password: 'password123', // Will be hashed by the pre-save hook
      role: 'nurse',
      phoneNumber: '14073945370', // Replace with a valid phone number for testing
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    });

    // Create test patient
    const testPatient = new User({
      name: 'Test Patient',
      email: 'testpatient@fallguardian.com',
      password: 'password123', // Will be hashed by the pre-save hook
      role: 'patient',
      phoneNumber: '14073945370', // Replace with a valid phone number for testing
      avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
      age: 65
    });

    // Save test users, handling duplicates
    try {
      const existingNurse = await User.findOne({ email: testNurse.email });
      if (existingNurse) {
        console.log(`Nurse with email ${testNurse.email} already exists.`);
        console.log('Nurse details:', existingNurse);
      } else {
        await testNurse.save();
        console.log('Test nurse created successfully.');
      }
    } catch (error) {
      console.error('Error creating nurse:', error.message);
    }

    try {
      const existingPatient = await User.findOne({ email: testPatient.email });
      if (existingPatient) {
        console.log(`Patient with email ${testPatient.email} already exists.`);
        console.log('Patient details:', existingPatient);
      } else {
        await testPatient.save();
        console.log('Test patient created successfully.');
      }
    } catch (error) {
      console.error('Error creating patient:', error.message);
    }

    // If both users exist, make sure they're linked
    const nurse = await User.findOne({ email: testNurse.email });
    const patient = await User.findOne({ email: testPatient.email });
    
    if (nurse && patient) {
      // Assign patient to nurse
      if (!nurse.assignedPatients.includes(patient._id)) {
        nurse.assignedPatients.push(patient._id);
        await nurse.save();
        console.log('Patient assigned to nurse.');
      } else {
        console.log('Patient already assigned to nurse.');
      }
      
      // Set nurseId on patient
      if (!patient.nurseId || !patient.nurseId.equals(nurse._id)) {
        patient.nurseId = nurse._id;
        await patient.save();
        console.log('Nurse assigned to patient.');
      } else {
        console.log('Nurse already assigned to patient.');
      }
      
      console.log('Nurse and patient linked successfully.');
    }

    console.log('Test users creation completed.');
    
    // Print out the created users
    console.log('\n=== Test Nurse ===');
    const nurseInfo = await User.findOne({ email: testNurse.email });
    console.log('ID:', nurseInfo._id);
    console.log('Email:', nurseInfo.email);
    console.log('Phone:', nurseInfo.phoneNumber);
    console.log('Role:', nurseInfo.role);
    console.log('Assigned Patients:', nurseInfo.assignedPatients);
    
    console.log('\n=== Test Patient ===');
    const patientInfo = await User.findOne({ email: testPatient.email });
    console.log('ID:', patientInfo._id);
    console.log('Email:', patientInfo.email);
    console.log('Phone:', patientInfo.phoneNumber);
    console.log('Role:', patientInfo.role);
    console.log('Assigned Nurse:', patientInfo.nurseId);
    
  } catch (error) {
    console.error('Error seeding test users:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the seed function
seedTestUsers(); 