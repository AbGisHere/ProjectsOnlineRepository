-- PRO — Project Online Repository
-- Seed script with sample data for the demo. Run after ddl.sql.
-- Run via: npm run seed   (see scripts/runSql.js)
--
-- Emails follow the sign-in rules: students @vitstudent.ac.in, faculty
-- @vit.ac.in, admins any address.
--
-- NOTE: Student/Faculty/Admin passwords below are bcrypt hashes of "password123"
-- so you can log in via POST /auth/login during the demo with that password.

-- ===========================================================================
-- Department (5)
-- ===========================================================================
INSERT INTO Department (Department_ID, Department_Name) VALUES (1, 'Computer Science Engineering');
INSERT INTO Department (Department_ID, Department_Name) VALUES (2, 'Information Technology');
INSERT INTO Department (Department_ID, Department_Name) VALUES (3, 'Electronics & Communication');
INSERT INTO Department (Department_ID, Department_Name) VALUES (4, 'Electrical Engineering');
INSERT INTO Department (Department_ID, Department_Name) VALUES (5, 'Mechanical Engineering');

-- ===========================================================================
-- Student (18)  -- password for all: password123
-- ===========================================================================
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1001, 'Aarav Sharma', 'aarav.sharma@vitstudent.ac.in', 1, 3, 120, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 85.5);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1002, 'Diya Patel', 'diya.patel@vitstudent.ac.in', 1, 3, 118, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 90.0);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1003, 'Vihaan Reddy', 'vihaan.reddy@vitstudent.ac.in', 2, 4, 145, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 78.25);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1004, 'Ananya Iyer', 'ananya.iyer@vitstudent.ac.in', 2, 4, 150, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 92.75);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1005, 'Kabir Singh', 'kabir.singh@vitstudent.ac.in', 1, 2, 80, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 70.0);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1006, 'Ishita Nair', 'ishita.nair@vitstudent.ac.in', 3, 3, 110, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 88.0);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1007, 'Reyansh Gupta', 'reyansh.gupta@vitstudent.ac.in', 3, 4, 140, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 81.5);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1008, 'Myra Joshi', 'myra.joshi@vitstudent.ac.in', 4, 2, 82, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 76.0);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1009, 'Arjun Mehta', 'arjun.mehta@vitstudent.ac.in', 4, 3, 115, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 83.0);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1010, 'Saanvi Rao', 'saanvi.rao@vitstudent.ac.in', 5, 4, 148, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 94.5);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1011, 'Vivaan Kulkarni', 'vivaan.kulkarni@vitstudent.ac.in', 5, 3, 112, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 79.0);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1012, 'Anika Desai', 'anika.desai@vitstudent.ac.in', 1, 4, 150, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 96.0);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1013, 'Aditya Verma', 'aditya.verma@vitstudent.ac.in', 2, 2, 78, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 72.5);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1014, 'Kiara Menon', 'kiara.menon@vitstudent.ac.in', 3, 3, 108, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 87.25);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1015, 'Krishna Pillai', 'krishna.pillai@vitstudent.ac.in', 4, 4, 142, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 80.0);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1016, 'Riya Choudhary', 'riya.choudhary@vitstudent.ac.in', 5, 2, 84, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 75.5);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1017, 'Shaurya Bhatt', 'shaurya.bhatt@vitstudent.ac.in', 1, 3, 116, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 82.75);
INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score) VALUES (1018, 'Prisha Agarwal', 'prisha.agarwal@vitstudent.ac.in', 2, 3, 119, '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 89.0);

-- ===========================================================================
-- Faculty (9)  -- password for all: password123
-- ===========================================================================
INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score) VALUES (2001, 'Dr. Rakesh Kumar', 'rakesh.kumar@vit.ac.in', 1, 'Professor', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 91.0);
INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score) VALUES (2002, 'Dr. Sunita Rao', 'sunita.rao@vit.ac.in', 1, 'Associate Professor', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 88.5);
INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score) VALUES (2003, 'Dr. Manoj Trivedi', 'manoj.trivedi@vit.ac.in', 2, 'Professor', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 90.0);
INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score) VALUES (2004, 'Dr. Priya Krishnan', 'priya.krishnan@vit.ac.in', 2, 'Assistant Professor', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 85.0);
INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score) VALUES (2005, 'Dr. Alok Sinha', 'alok.sinha@vit.ac.in', 3, 'Professor', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 93.5);
INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score) VALUES (2006, 'Dr. Meera Pillai', 'meera.pillai@vit.ac.in', 3, 'Associate Professor', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 87.0);
INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score) VALUES (2007, 'Dr. Vikram Chauhan', 'vikram.chauhan@vit.ac.in', 4, 'Professor', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 89.5);
INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score) VALUES (2008, 'Dr. Neha Bansal', 'neha.bansal@vit.ac.in', 5, 'Assistant Professor', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 84.0);
INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score) VALUES (2009, 'Dr. Suresh Iyer', 'suresh.iyer@vit.ac.in', 5, 'Associate Professor', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW', 86.5);

-- ===========================================================================
-- Admin (2)  -- password for all: password123
-- ===========================================================================
INSERT INTO Admin (Admin_ID, Name, Email, Password) VALUES (1, 'System Admin', 'admin@vit.edu', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW');
INSERT INTO Admin (Admin_ID, Name, Email, Password) VALUES (2, 'Placement Cell Admin', 'placement.admin@vit.edu', '$2b$10$nTb2rikYXmTRxduyYslmUukfD8b4A4ktOj3SrUnivosAGDJStRMdW');

-- ===========================================================================
-- Team (6) -- Leader must be Student, Guide must be Faculty
-- ===========================================================================
INSERT INTO Team (Team_ID, Team_Name, Leader_ID, Guide_ID) VALUES (3001, 'Byte Busters', 1001, 2001);
INSERT INTO Team (Team_ID, Team_Name, Leader_ID, Guide_ID) VALUES (3002, 'Neural Ninjas', 1003, 2003);
INSERT INTO Team (Team_ID, Team_Name, Leader_ID, Guide_ID) VALUES (3003, 'Circuit Breakers', 1006, 2005);
INSERT INTO Team (Team_ID, Team_Name, Leader_ID, Guide_ID) VALUES (3004, 'Data Dynamos', 1010, 2007);
INSERT INTO Team (Team_ID, Team_Name, Leader_ID, Guide_ID) VALUES (3005, 'Cloud Crafters', 1012, 2002);
INSERT INTO Team (Team_ID, Team_Name, Leader_ID, Guide_ID) VALUES (3006, 'Quantum Coders', 1017, 2004);

-- ===========================================================================
-- Team_Member (each team: leader + 2-3 more students)
-- ===========================================================================
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3001, 1001);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3001, 1002);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3001, 1005);

INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3002, 1003);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3002, 1004);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3002, 1013);

INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3003, 1006);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3003, 1007);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3003, 1014);

INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3004, 1010);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3004, 1011);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3004, 1016);

INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3005, 1012);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3005, 1008);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3005, 1009);

INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3006, 1017);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3006, 1018);
INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (3006, 1015);

-- ===========================================================================
-- Technology (12)
-- ===========================================================================
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4001, 'Node.js');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4002, 'React');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4003, 'Python');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4004, 'TensorFlow');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4005, 'Oracle DB');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4006, 'MongoDB');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4007, 'Flutter');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4008, 'Arduino');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4009, 'AWS');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4010, 'Docker');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4011, 'Java Spring Boot');
INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (4012, 'Solidity');

-- ===========================================================================
-- Domain (8)
-- ===========================================================================
INSERT INTO Domain (Domain_ID, Domain_Name) VALUES (5001, 'Artificial Intelligence');
INSERT INTO Domain (Domain_ID, Domain_Name) VALUES (5002, 'Web Development');
INSERT INTO Domain (Domain_ID, Domain_Name) VALUES (5003, 'IoT');
INSERT INTO Domain (Domain_ID, Domain_Name) VALUES (5004, 'Blockchain');
INSERT INTO Domain (Domain_ID, Domain_Name) VALUES (5005, 'Cybersecurity');
INSERT INTO Domain (Domain_ID, Domain_Name) VALUES (5006, 'Cloud Computing');
INSERT INTO Domain (Domain_ID, Domain_Name) VALUES (5007, 'Mobile Development');
INSERT INTO Domain (Domain_ID, Domain_Name) VALUES (5008, 'Data Science');

-- ===========================================================================
-- Category (6)
-- ===========================================================================
INSERT INTO Category (Category_ID, Category_Name) VALUES (6001, 'Academic Research');
INSERT INTO Category (Category_ID, Category_Name) VALUES (6002, 'Industry Sponsored');
INSERT INTO Category (Category_ID, Category_Name) VALUES (6003, 'Hackathon');
INSERT INTO Category (Category_ID, Category_Name) VALUES (6004, 'Open Source');
INSERT INTO Category (Category_ID, Category_Name) VALUES (6005, 'Capstone');
INSERT INTO Category (Category_ID, Category_Name) VALUES (6006, 'Social Impact');

-- ===========================================================================
-- Project (12)
-- ===========================================================================
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7001, 'Smart Attendance System using Face Recognition', 'An AI-based attendance system using facial recognition to automate classroom attendance.', '2025-2026', 3001, 'COMPLETED', 'https://github.com/bytebusters/smart-attendance', DATE '2026-04-10');
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7002, 'Chatbot for Student Query Resolution', 'An NLP powered chatbot that answers common student queries about courses and deadlines.', '2025-2026', 3002, 'SUBMITTED', 'https://github.com/neuralninjas/campus-chatbot', DATE '2026-04-12');
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7003, 'IoT Based Smart Irrigation System', 'A sensor-driven irrigation controller that optimizes water usage for farms.', '2025-2026', 3003, 'ONGOING', 'https://github.com/circuitbreakers/smart-irrigation', NULL);
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7004, 'Sales Forecasting Dashboard', 'A data science dashboard forecasting retail sales trends using time-series models.', '2025-2026', 3004, 'COMPLETED', 'https://github.com/datadynamos/sales-forecast', DATE '2026-03-28');
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7005, 'Cloud-Native Project Repository Platform', 'A microservices based platform for hosting and reviewing student projects, deployed on AWS.', '2025-2026', 3005, 'ONGOING', 'https://github.com/cloudcrafters/pro-platform', NULL);
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7006, 'Decentralized Voting System', 'A blockchain based voting application ensuring tamper-proof and transparent elections.', '2025-2026', 3006, 'SUBMITTED', 'https://github.com/quantumcoders/dvote', DATE '2026-04-15');
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7007, 'Campus Navigation Mobile App', 'A Flutter app helping freshers navigate the campus using indoor positioning.', '2024-2025', 3001, 'COMPLETED', 'https://github.com/bytebusters/campus-nav', DATE '2025-04-18');
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7008, 'Intrusion Detection using Machine Learning', 'A network intrusion detection system trained on the NSL-KDD dataset.', '2024-2025', 3002, 'COMPLETED', 'https://github.com/neuralninjas/ids-ml', DATE '2025-04-20');
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7009, 'Home Automation via Voice Assistant', 'An Arduino + voice assistant integration for controlling home appliances.', '2024-2025', 3003, 'COMPLETED', 'https://github.com/circuitbreakers/home-automation', DATE '2025-04-22');
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7010, 'Employee Attrition Prediction', 'A predictive model to flag employees likely to leave, built for an industry partner.', '2024-2025', 3004, 'COMPLETED', 'https://github.com/datadynamos/attrition-predict', DATE '2025-04-25');
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7011, 'Serverless Image Processing Pipeline', 'An AWS Lambda based pipeline for on-the-fly image resizing and tagging.', '2025-2026', 3005, 'REJECTED', 'https://github.com/cloudcrafters/img-pipeline', DATE '2026-03-01');
INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date) VALUES
  (7012, 'NFT Marketplace for Student Artwork', 'A Solidity smart contract marketplace letting students mint and sell digital artwork.', '2025-2026', 3006, 'ONGOING', 'https://github.com/quantumcoders/art-nft', NULL);

-- ===========================================================================
-- Project_Technology
-- ===========================================================================
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7001, 4003);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7001, 4004);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7002, 4001);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7002, 4002);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7003, 4008);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7003, 4001);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7004, 4003);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7004, 4005);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7005, 4001);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7005, 4009);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7005, 4010);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7006, 4012);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7007, 4007);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7008, 4003);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7008, 4004);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7009, 4008);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7010, 4003);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7011, 4009);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7012, 4012);
INSERT INTO Project_Technology (Project_ID, Technology_ID) VALUES (7012, 4002);

-- ===========================================================================
-- Project_Domain
-- ===========================================================================
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7001, 5001);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7002, 5001);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7002, 5002);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7003, 5003);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7004, 5008);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7005, 5006);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7005, 5002);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7006, 5004);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7007, 5007);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7008, 5005);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7008, 5001);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7009, 5003);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7010, 5008);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7011, 5006);
INSERT INTO Project_Domain (Project_ID, Domain_ID) VALUES (7012, 5004);

-- ===========================================================================
-- Project_Category
-- ===========================================================================
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7001, 6005);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7002, 6004);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7003, 6006);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7004, 6002);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7005, 6005);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7006, 6003);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7007, 6005);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7008, 6001);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7009, 6006);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7010, 6002);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7011, 6005);
INSERT INTO Project_Category (Project_ID, Category_ID) VALUES (7012, 6003);

-- ===========================================================================
-- Evaluation (16)
-- ===========================================================================
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8001, 7001, 2001, 88, 'Solid implementation, good accuracy on test set.', DATE '2026-04-15');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8002, 7001, 2002, 91, 'Excellent UI and well documented code.', DATE '2026-04-16');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8003, 7002, 2003, 76, 'Chatbot needs better intent classification.', DATE '2026-04-17');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8004, 7004, 2007, 85, 'Forecast model performs well, add more test data.', DATE '2026-04-02');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8005, 7004, 2003, 82, 'Good visualization dashboard.', DATE '2026-04-03');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8006, 7006, 2004, 79, 'Smart contract needs gas optimization.', DATE '2026-04-20');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8007, 7007, 2001, 90, 'Great UX for a navigation app.', DATE '2025-04-22');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8008, 7007, 2002, 87, 'Indoor positioning accuracy could improve.', DATE '2025-04-23');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8009, 7008, 2005, 93, 'Very strong results on benchmark dataset.', DATE '2025-04-25');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8010, 7008, 2006, 89, 'Well-structured report and clean code.', DATE '2025-04-26');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8011, 7009, 2005, 84, 'Nice hardware-software integration.', DATE '2025-04-27');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8012, 7010, 2007, 81, 'Model interpretability could be improved.', DATE '2025-04-28');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8013, 7010, 2008, 78, 'Consider fairness metrics for HR use case.', DATE '2025-04-29');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8014, 7011, 2002, 55, 'Pipeline fails under high concurrency, needs rework.', DATE '2026-03-10');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8015, 7003, 2005, 70, 'Good progress, continue field testing.', DATE '2026-03-15');
INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date) VALUES (8016, 7005, 2002, 74, 'Good architecture, add more integration tests.', DATE '2026-03-20');

-- ===========================================================================
-- Better Auth sign-in accounts: one auth_user + credential auth_account per
-- Student, Faculty and Admin, reusing the same bcrypt password hash so every
-- seeded person signs in to the web app with password123.
-- ===========================================================================
INSERT INTO auth_user (id, name, email, email_verified, user_role, ref_id)
  SELECT 'student-' || Student_ID, Name, Email, 1, 'student', Student_ID FROM Student;
INSERT INTO auth_user (id, name, email, email_verified, user_role, ref_id)
  SELECT 'faculty-' || Faculty_ID, Name, Email, 1, 'faculty', Faculty_ID FROM Faculty;
INSERT INTO auth_user (id, name, email, email_verified, user_role, ref_id)
  SELECT 'admin-' || Admin_ID, Name, Email, 1, 'admin', Admin_ID FROM Admin;

INSERT INTO auth_account (id, account_id, provider_id, user_id, password)
  SELECT 'acct-student-' || Student_ID, 'student-' || Student_ID, 'credential', 'student-' || Student_ID, Password FROM Student;
INSERT INTO auth_account (id, account_id, provider_id, user_id, password)
  SELECT 'acct-faculty-' || Faculty_ID, 'faculty-' || Faculty_ID, 'credential', 'faculty-' || Faculty_ID, Password FROM Faculty;
INSERT INTO auth_account (id, account_id, provider_id, user_id, password)
  SELECT 'acct-admin-' || Admin_ID, 'admin-' || Admin_ID, 'credential', 'admin-' || Admin_ID, Password FROM Admin;

COMMIT;
