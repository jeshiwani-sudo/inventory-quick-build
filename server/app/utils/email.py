from flask_mail import Message
from app import mail
from flask import current_app

def send_invite_email(to_email, invite_link, role):
    try:
        msg = Message(
            subject=f'You have been invited as {role.capitalize()} - Inventory App',
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[to_email]
        )
        msg.body = f'''
Hello!

You have been invited to join the Inventory App as a {role.capitalize()}.

Please click the link below to complete your registration.
This link will expire in 24 hours.

{invite_link}

If you did not expect this email, please ignore it.

Thank you,
Inventory App Team
        '''
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False