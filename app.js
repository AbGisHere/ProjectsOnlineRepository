const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const teamRoutes = require('./routes/teamRoutes');
const teamMemberRoutes = require('./routes/teamMemberRoutes');
const projectRoutes = require('./routes/projectRoutes');
const technologyRoutes = require('./routes/technologyRoutes');
const domainRoutes = require('./routes/domainRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'PRO — Project Online Repository API is running' });
});

app.use('/auth', authRoutes);
app.use('/departments', departmentRoutes);
app.use('/students', studentRoutes);
app.use('/faculty', facultyRoutes);
app.use('/teams', teamRoutes);
app.use('/team-members', teamMemberRoutes);
app.use('/projects', projectRoutes);
app.use('/technologies', technologyRoutes);
app.use('/domains', domainRoutes);
app.use('/categories', categoryRoutes);
app.use('/evaluations', evaluationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
