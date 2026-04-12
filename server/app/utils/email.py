from flask_mailman import EmailMessage
from flask import current_app


def send_invite_email(to_email, invite_link, role, store_name):
    try:
        msg = EmailMessage(
            subject=f"You're invited to join {store_name} on Local Shop",
            from_email=current_app.config.get('MAIL_DEFAULT_SENDER'),
            to=[to_email],
            body=f"""
Hello,

You have been invited to join {store_name} as a {role.capitalize()} on Local Shop.

Click the link below to complete your registration:
{invite_link}

This link will expire in 48 hours.

If you did not expect this invitation, please ignore this email.

Best regards,
Local Shop Team
            """
        )

        msg.content_subtype = 'html'
        msg.body = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📦 Local Shop</h1>
        <p style="color: #E0E7FF; margin: 8px 0 0;">Inventory Management System</p>
    </div>

    <div style="background: #F9FAFB; padding: 30px; border-radius: 12px;">
        <h2>You've been invited! 🎉</h2>
        <p>
            You have been invited to join <strong>{store_name}</strong> as a
            <strong>{role.capitalize()}</strong>.
        </p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{invite_link}"
               style="background: #4F46E5; color: white; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: bold;
                      display: inline-block;">
                Complete Registration →
            </a>
        </div>

        <p style="font-size: 12px; color: #9CA3AF;">
            This link expires in 48 hours.
        </p>
    </div>
</body>
</html>
        """

        msg.send()
        print(f"✅ Invite email sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send invite email to {to_email}: {str(e)}")
        return False


def send_reset_password_email(to_email, reset_link):
    try:
        msg = EmailMessage(
            subject="Reset Your Password - Local Shop",
            from_email=current_app.config.get('MAIL_DEFAULT_SENDER'),
            to=[to_email],
        )

        msg.content_subtype = 'html'
        msg.body = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📦 Local Shop</h1>
        <p style="color: #E0E7FF; margin: 8px 0 0;">Inventory Management System</p>
    </div>

    <div style="background: #F9FAFB; padding: 30px; border-radius: 12px;">
        <h2>Password Reset Request 🔐</h2>
        <p>We received a request to reset the password for your Local Shop account.</p>
        <p>Click the button below to set a new password.</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}"
               style="background: #DC2626; color: white; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: bold;
                      display: inline-block;">
                Reset My Password →
            </a>
        </div>

        <p style="font-size: 12px; color: #9CA3AF;">
            This link expires in 2 hours. If you did not request this, ignore this email.
        </p>
    </div>
</body>
</html>
        """

        msg.send()
        print(f"✅ Password reset email sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send reset email to {to_email}: {str(e)}")
        return False