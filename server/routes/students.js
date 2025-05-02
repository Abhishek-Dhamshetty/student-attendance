const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET all students
router.get('/', async (req, res, next) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    next(err);
  }
});

// POST a new student
router.post('/', async (req, res, next) => {
  try {
    const { name, rollNumber } = req.body;

    // Validate name and rollNumber
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Student name is required' });
    }
    if (!rollNumber || typeof rollNumber !== 'string' || rollNumber.trim() === '') {
      return res.status(400).json({ message: 'Roll number is required' });
    }

    const student = new Student({
      name: name.trim(),
      rollNumber: rollNumber.trim(),
    });

    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    if (err.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({ message: 'Roll number must be unique' });
    }
    next(err);
  }
});

// PUT update student attendance
router.put('/:id/attendance', async (req, res, next) => {
  try {
    const { attendance } = req.body;
    
    if (!['Present', 'Absent', 'Given'].includes(attendance)) {
      return res.status(400).json({ message: 'Invalid attendance status' });
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { attendance },
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }
    next(err);
  }
});

module.exports = router;
