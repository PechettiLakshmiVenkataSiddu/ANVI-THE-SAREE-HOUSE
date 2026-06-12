import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  if (!name || !email || !message) {
    return Response.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  try {
    // Email to you (admin)
    await transporter.sendMail({
      from: `"Anvi The Saree House" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    })

    // Auto-reply to customer
    await transporter.sendMail({
      from: `"Anvi The Saree House" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'We received your message!',
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for reaching out to <strong>Anvi The Saree House</strong>.</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <br/>
        <p>Warm regards,<br/>Anvi The Saree House Team</p>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return Response.json({ error: 'Failed to send email.' }, { status: 500 })
  }
}