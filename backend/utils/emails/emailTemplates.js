export const createContactEmailTemplate = ({
  firstName,
  lastName,
  email,
  subject,
  message,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Message</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="
    background: linear-gradient(to right, #111827, #374151);
    padding: 30px;
    text-align: center;
    border-radius: 10px 10px 0 0;
  ">
    <h1 style="color:white; margin:0; font-size:28px;">
      New Portfolio Contact
    </h1>
  </div>


  <div style="
    background:#ffffff;
    padding:30px;
    border-radius:0 0 10px 10px;
    box-shadow:0 4px 10px rgba(0,0,0,0.1);
  ">

    <p style="font-size:18px; color:#111827;">
      <strong>Hello Debabrata,</strong>
    </p>


    <p>
      You received a new message from your portfolio website.
    </p>


    <div style="
      background:#f3f4f6;
      padding:20px;
      border-radius:8px;
      margin:20px 0;
    ">

      <p style="margin:8px 0;">
        <strong>Name:</strong> ${firstName} ${lastName}
      </p>

      <p style="margin:8px 0;">
        <strong>Email:</strong> ${email}
      </p>

      <p style="margin:8px 0;">
        <strong>Subject:</strong> ${subject}
      </p>

    </div>


    <div style="
      background:#f9fafb;
      padding:20px;
      border-radius:8px;
      border-left:4px solid #111827;
    ">

      <p style="font-size:16px;font-weight:bold;">
        Message:
      </p>

      <p>
        ${message}
      </p>

    </div>


    <div style="text-align:center;margin:30px 0;">

      <a
        href="mailto:${email}"
        style="
          background:#111827;
          color:white;
          padding:14px 28px;
          text-decoration:none;
          border-radius:30px;
          font-weight:bold;
          font-size:16px;
        "
      >
        Reply to ${firstName}
      </a>

    </div>


    <p>
      Thank you for keeping your portfolio connected.
    </p>


    <p>
      Best regards,<br>
      <strong>Portfolio Team</strong>
    </p>


  </div>

</body>
</html>
`;
