require('dotenv').config();  // Load env variables

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Apply route
app.post('/apply', upload.single('cv'), async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const file = req.file;

    console.log('📥 Form fields:', { name, email, phone, role });
    if (file) {
      console.log(`📁 Uploaded file: ${file.originalname}, type: ${file.mimetype}`);
    } else {
      console.log('📁 No file uploaded');
    }

    if (!name || !email || !phone || !role) {
      return res.status(400).json({ error: 'All fields except CV are required' });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    // HTML content for admin
    const adminHtml = `
      <h2>📩 New Career Application</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Role Applied For:</strong> ${role}</p>
      <hr>
      <p>CV is attached with this email.</p>
    `;

    // Mail to Admin
    const adminMailOptions = {
      from: `"Career Application" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Application from ${name}`,
      text: `New application from ${name} (${email}) for the role of ${role}.`,
      html: adminHtml,
      attachments: file ? [{
        filename: file.originalname,
        content: file.buffer
      }] : []
    };

    // HTML content for applicant confirmation
    const userHtml = `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://i.postimg.cc/h4ZkBQjM/TAMSA-LOGO-1-page-0001-removebg-preview.png" alt="Tamsa Logo" style="height: 60px;">
    </div>

    <h2 style="color: #2c3e50;">Thank you for applying to Tamsa!</h2>
    <p>Dear ${name},</p>

    <p>We have successfully received your application for the <strong>${role}</strong> role.</p>
    <p>Our team will review your details and get back to you shortly.</p>

    <p style="margin-top: 30px;">Warm regards,<br><strong>Team Tamsa</strong></p>

    <hr style="margin: 40px 0;">

    <div style="text-align: center;">
      <p style="margin-bottom: 10px;">Connect with us:</p>
      <a href="https://www.instagram.com/tamsaintegrated/" style="margin: 0 10px;">
        <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="24" height="24">
      </a>
      <a href="https://www.linkedin.com/company/tamsa-events/" style="margin: 0 10px;">
        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="24" height="24">
      </a>
      <a href="https://wa.me/919703510709?text=Hi%20Tamsa%2C%20I%E2%80%99m%20interested%20in%20your%20event%20management%20services.%20Could%20we%20connect%20to%20discuss%20more%20details%3F" style="margin: 0 10px;" target="_blank" rel="noopener noreferrer">
         <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" width="24" height="24">
        </a>

    </div>

    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
      © ${new Date().getFullYear()} Tamsa. All rights reserved.
    </p>
  </div>
`;


    // Mail to User
    const userMailOptions = {
      from: `"Tamsa Careers" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `We've received your application, ${name}`,
      text: `Thank you for applying for the ${role} role at Tamsa. We will get back to you shortly.`,
      html: userHtml
    };

    console.log('📤 Sending emails...');
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    console.log('✅ Both emails sent successfully!');

    res.json({ message: 'Application sent successfully!' });

  } catch (error) {
    console.error('❌ Error sending application email:', error);
    res.status(500).json({ error: 'Failed to send application' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
