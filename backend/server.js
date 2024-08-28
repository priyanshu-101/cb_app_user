const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '8520',
  database: 'cb_app'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
  console.log('MySQL connected');
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes
app.post('/Application/:employeeId', upload.single('attachment'), (req, res) => {
  const { reason, employee_name } = req.body;
  const { employeeId } = req.params;
  const file = req.file;

  if (!reason || !employee_name) {
    return res.status(400).send('Reason and employee name cannot be empty.');
  }

  let attachmentFile = null;
  if (file) {
    attachmentFile = file.path; // Use file.path for disk storage
  }

  const query = 'INSERT INTO leave_application (reason, attachment_file, employee_name) VALUES (?, ?, ?)';
  db.query(query, [reason, attachmentFile, employee_name], (err, results) => {
    if (err) {
      return res.status(500).send('Failed to save application: ' + err.message);
    }
    res.status(200).send('Application submitted successfully.');
  });
});

// Login endpoint
app.post('/Login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM employee WHERE email_address = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      return res.status(200).json({ success: true, employee: results[0] });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.get('/Profile/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;
  const query = 'SELECT employee_name FROM employee WHERE employee_id = ?';

  db.query(query, [employeeId], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result[0]);
    }
  });
});

// Get salary details
app.get('/Salary/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;
  const sql = 'SELECT * FROM salary_details WHERE id = ?';
  db.query(sql, [employeeId], (err, result) => {
    if (err) return res.status(500).send('Database query error: ' + err.message);
    res.json(result);
  });
});

// Get holiday list
app.get('/HolidayList/:employeeId', (req, res) => {
  const query = 'SELECT * FROM holidays';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err.message });
    }
    res.json(results);
  });
});

// Get notices
app.get('/Notice/:employeeId', (req, res) => {
  const sql = 'SELECT * FROM notices ORDER BY timestamp DESC';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err.message });
    }
    res.json(result);
  });
});

// Get employee details
app.get('/Employee/:id', (req, res) => {
  const employeeId = req.params.id;
  const query = 'SELECT * FROM employee WHERE employee_id = ?';
  db.query(query, [employeeId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err.message });
    }
    if (result.length > 0) {
      res.json(result[0]); // Assuming employee_id is unique and returns one row
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  });
});

app.post('/Camera/:employeeId', (req, res) => {
  const { employee_name, employee_photo, attendance_date, attendance_time, location_latitude, location_longitude, city } = req.body;

  const query = `
    INSERT INTO mark_attendance 
    (employee_name, employee_photo, attendance_date, attendance_time, location_latitude, location_longitude, city) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [employee_name, employee_photo, attendance_date, attendance_time, location_latitude, location_longitude, city], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Failed to mark attendance' });
      return;
    }
    res.status(200).json({ message: 'Attendance marked successfully' });
  });
});

// New route for fetching sites
app.get('/Camera/:employeeId', (req, res) => {
  const query = 'SELECT * FROM sites';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err.message });
    }
    res.json(results);
  });
});

app.get('/ViewAtt/:employeeName', (req, res) => {
  const { employeeName, status } = req.query;

  if (status === 'On Leave') {
    const query = 'SELECT * FROM leave_application WHERE employee_name = ?';
    db.query(query, [employeeName], (error, results) => {
      if (error) {
        console.error('Error fetching leave applications:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
  } else if (status === 'Present') {
    // Assuming you need to query attendance details from another table
    const query = 'SELECT * FROM mark_attendance WHERE employee_name = ?';
    db.query(query, [employeeName], (error, results) => {
      if (error) {
        console.error('Error fetching attendance details:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
  } else {
    res.status(400).json({ error: 'Invalid status' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
