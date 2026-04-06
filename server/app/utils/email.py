# backend/app/utils/email.py
from flask_mail import Message
from app import mail
from flask import current_app

def send_invite_email(to_email, invite_link, role, store_name="LocalShop"):
    try:
        msg = Message(
            subject=f"Invitation to Join {store_name} as {role.capitalize()}",
            sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
            recipients=[to_email]
        )

        # Better formatted email
        msg.body = f"""
Hello,

You have been invited to join **{store_name}** as a **{role.capitalize()}**.

Please click the link below to complete your registration:

{invite_link}

This link will expire in 24 hours.

If you did not request this invitation, please ignore this email.

Best regards,
{store_name} Team
        """

        mail.send(msg)
        print(f"✅ Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False
    
# Password reset
def send_reset_password_email(to_email, reset_link):
    try:
        msg = Message(
            subject="Reset Your Password - LocalShop",
            sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
            recipients=[to_email]
        )

        msg.body = f"""
Hello,

You requested to reset your password.

Click the link below to set a new password:

{reset_link}

This link will expire in 2 hours.

If you did not request this, please ignore this email.

Best regards,
LocalShop Team
        """

        mail.send(msg)
        print(f"✅ Password reset email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send reset email to {to_email}: {str(e)}")
        return False