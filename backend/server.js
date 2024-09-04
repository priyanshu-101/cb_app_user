const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

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

// Create HTTP server and integrate Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Routes
app.post('/Application/:employeeUsername', upload.single('attachment'), (req, res) => {
  const { reason } = req.body;
  const employeeUsername = req.params.employeeUsername;
  const attachment = req.file;

  const query = 'INSERT INTO leave_application (reason, attachment_file, employee_username) VALUES (?, ?, ?)';
  const values = [reason, attachment ? attachment.buffer : null, employeeUsername];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error inserting application:', err);
      return res.status(500).send('Failed to save application');
    }
    res.send('Application submitted successfully');
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

app.get('/Profile/:employeeUsername', (req, res) => {
  const { employeeUsername } = req.params;
  const query = 'SELECT employee_name FROM employee WHERE employee_username = ?';

  db.query(query, [employeeUsername], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result[0]);
    }
  });
});

// Get salary details
app.get('/Salary/:employeeUsername', (req, res) => {
  const { employeeUsername } = req.params;
  const sql = 'SELECT * FROM salary_details WHERE employee_username = ?';
  db.query(sql, [employeeUsername], (err, result) => {
    if (err) return res.status(500).send('Database query error: ' + err.message);
    res.json(result);
  });
});

// Get holiday list
app.get('/HolidayList/:employeeUsername', (req, res) => {
  const query = 'SELECT * FROM holidays';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err.message });
    }
    res.json(results);
  });
});

// Get notices
app.get('/Notice/:employeeUsername', (req, res) => {
  const sql = 'SELECT * FROM notices ORDER BY timestamp DESC';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err.message });
    }
    res.json(result);
  });
});

// Get employee details
app.get('/Employee/:employeeUsername', (req, res) => {
  const { employeeUsername } = req.params;
  const query = 'SELECT * FROM employee WHERE employee_username = ?';
  db.query(query, [employeeUsername], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err.message });
    }
    if (result.length > 0) {
      res.json(result[0]); // Assuming employee_username is unique and returns one row
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  });
});

app.post('/Camera/:employeeUsername', (req, res) => {
  const { employee_username, employee_photo, attendance_date, attendance_time, location_latitude, location_longitude, city } = req.body;

  const query = `
    INSERT INTO mark_attendance 
    (employee_username, employee_photo, attendance_date, attendance_time, location_latitude, location_longitude, city) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [employee_username, employee_photo, attendance_date, attendance_time, location_latitude, location_longitude, city], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Failed to mark attendance' });
      return;
    }
    res.status(200).json({ message: 'Attendance marked successfully' });
  });
});

// New route for fetching sites
app.get('/Camera/:employeeUsername', (req, res) => {
  const query = 'SELECT * FROM sites';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err.message });
    }
    res.json(results);
  });
});

app.get('/ViewAtt/:employeeUsername', (req, res) => {
  const employeeUsername = req.params.employeeUsername;
  const status = req.query.status;
  const month = req.query.month; // Assuming month is passed as 'MM'
  const year = req.query.year;   // Assuming year is passed as 'YYYY'

  let query;
  let queryParams = [employeeUsername];

  if (status === 'On Leave') {
    query = `
      SELECT * FROM leave_application 
      WHERE employee_username = ? 
      AND MONTH(applied_on) = ? 
      AND YEAR(applied_on) = ?`;
    queryParams.push(month, year);
  } else if (status === 'Present') {
    query = `
      SELECT * FROM mark_attendance 
      WHERE employee_username = ? 
      AND MONTH(attendance_date) = ? 
      AND YEAR(attendance_date) = ?`;
    queryParams.push(month, year);
  } else {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});


app.post('/Notice/:employeeUsername', (req, res) => {
  const notice_id = req.body.notice_id;
  const employee_username = req.params.employeeUsername;

  if (!notice_id || !employee_username) {
    res.status(400).send('Missing required parameters');
    return;
  }

  const sql = 'INSERT INTO notice_confirmations (notice_id, employee_username) VALUES (?, ?)';

  db.query(sql, [notice_id, employee_username], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        // MySQL error code for duplicate entry
        res.status(409).send('Notice already submitted');
      } else {
        console.error('Error inserting into notice_confirmations:', err);
        res.status(500).send('Server Error');
      }
    } else {
      res.send('Notice successfully confirmed');
    }
  });
});
app.post('/Salary/:employeeUsername', async (req, res) => {
  const {
    total_salary,
    advance_taken_amount,
    advance_taken_date,
    bonus_amount,
    bonus_date,
    final_salary,
    employee_username,
    advance_reason,
    bonus_reason
  } = req.body;

  const sql = `
    INSERT INTO confirm_salary (
      total_salary, advance_taken_amount, advance_taken_date, 
      bonus_amount, bonus_date, final_salary, 
      employee_username, advance_reason, bonus_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(sql, [
      total_salary, advance_taken_amount, advance_taken_date, 
      bonus_amount, bonus_date, final_salary, 
      employee_username, advance_reason, bonus_reason
    ]);
    res.status(200).json({ message: 'Salary confirmed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm salary', error });
  }
});



// Start server with socket.io
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
