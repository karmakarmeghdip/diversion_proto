import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'souradip12b@gmail.com',
  subject: 'Time to Return to yourmind.space - We Miss You!',
  html: `
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="assests/yourmind.space.png" alt="yourmind.space logo" style="max-width: 150px; height: auto; margin-bottom: 15px;">
              <h2 style="color: #c6a0f6; font-size: 24px; margin: 0;">yourmind.space</h2>
            </div>
            
            <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Your Digital Space Misses You!</h1>
            
            <div style="border-left: 4px solid #ca9ee6; padding-left: 20px; margin: 20px 0;">
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Hey there! 👋 We noticed it's been a while since you visited yourmind.space. 
                Your personal space is waiting for your thoughts, memories, and reflections.
              </p>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #ca9ee6; margin-top: 0;">Why Return to yourmind.space Today?</h2>
              <ul style="color: #666; font-size: 15px; line-height: 1.5;">
                <li>Your private space to capture thoughts and feelings</li>
                <li>Track your personal growth journey</li>
                <li>Reflect in your own digital sanctuary</li>
                <li>Practice mindfulness your way</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="#" style="
                background-color: #ca9ee6;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                display: inline-block;
              ">Return to yourmind.space</a>
            </div>

            <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
              If you received this by mistake, please ignore this email. You're receiving this because you're a member of yourmind.space
            </p>
          </div>
        </div>
      </body>
    </html>
  `
});