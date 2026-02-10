from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from whitenoise import WhiteNoise
import os
import uuid
import smtplib
from email.message import EmailMessage
from datetime import datetime
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Static file serving with WhiteNoise
app.wsgi_app = WhiteNoise(app.wsgi_app, root='./', index_file=True)
app.wsgi_app.add_files('./', prefix='/')

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Return the URL to access the file
            return jsonify({'url': f'/uploads/{filename}', 'filename': filename}), 200
        
        return jsonify({'error': 'Invalid file type'}), 400
    except Exception as e:
        print(f'Error uploading file: {e}')
        return jsonify({'error': 'Server error during upload'}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/delete', methods=['POST'])
def delete_file():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'No filename provided'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({'success': True}), 200
        
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        print(f'Error deleting file: {e}')
        return jsonify({'error': 'Server error during deletion'}), 500

def get_smtp_config():
    smtp_host = os.environ.get('SMTP_HOST', '').strip()
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER', '').strip()
    smtp_password = os.environ.get('SMTP_PASSWORD', '').strip()
    smtp_from = os.environ.get('SMTP_FROM', 'order@livingflex.dk').strip()
    smtp_use_tls = os.environ.get('SMTP_USE_TLS', 'true').strip().lower() in ('1', 'true', 'yes')
    smtp_use_ssl = os.environ.get('SMTP_USE_SSL', 'false').strip().lower() in ('1', 'true', 'yes')

    missing = []
    if not smtp_host:
        missing.append('SMTP_HOST')
    if not smtp_user:
        missing.append('SMTP_USER')
    if not smtp_password:
        missing.append('SMTP_PASSWORD')
    if not smtp_from:
        missing.append('SMTP_FROM')

    return {
        'smtp_host': smtp_host,
        'smtp_port': smtp_port,
        'smtp_user': smtp_user,
        'smtp_password': smtp_password,
        'smtp_from': smtp_from,
        'smtp_use_tls': smtp_use_tls,
        'smtp_use_ssl': smtp_use_ssl,
        'missing': missing
    }

def get_brevo_api_key():
    return os.environ.get('BREVO_API_KEY', '').strip()

def format_order_items(order):
    items = order.get('products') or []
    if not items:
        return 'No items'

    lines = []
    for item in items:
        name = item.get('name', 'Item')
        quantity = item.get('quantity', 1)
        orientation = item.get('selectedOrientation')
        orientation_text = ''
        if orientation == 'right':
            orientation_text = ' (Right-oriented)'
        elif orientation == 'left':
            orientation_text = ' (Left-oriented)'
        lines.append(f"- {name}{orientation_text} x{quantity}")
    return "\n".join(lines)

def format_delivery_option(order):
    if order.get('packageType') == 'ready':
        return 'Extra room - 500 DKK / month' if order.get('extraRoomSelected') else 'No extra room - 0 DKK / month'

    delivery_option = order.get('deliveryOption') or {}
    if delivery_option.get('type') == 'setup':
        return 'Delivery and Setup - 2,000 DKK'
    return 'Curbside Delivery - 0 DKK'

def build_order_email(order, totals):
    order_id = order.get('id', '')
    subject = f"Order confirmation #{order_id}"
    created_at = order.get('createdAt') or ''
    created_at_text = ''
    if created_at:
        try:
            created_at_text = datetime.fromisoformat(created_at.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M')
        except ValueError:
            created_at_text = created_at

    body_lines = [
        "Thank you for your order.",
        "",
        f"Order number: #{order_id}"
    ]
    if created_at_text:
        body_lines.append(f"Order date: {created_at_text}")
    body_lines.extend([
        "",
        "Customer information:",
        f"Name: {order.get('name', '')}",
        f"Email: {order.get('email', '')}",
        f"Phone: {order.get('phoneNumber', '')}",
        f"Address: {order.get('address', '')}",
        f"Installation week: {order.get('installationWeek', 'Not specified')}",
        f"Installation date: {order.get('installationDate', 'Not specified')}",
        "",
        "Delivery option:",
        format_delivery_option(order),
        "",
        "Order items:",
        format_order_items(order),
        "",
        "Pricing:",
        f"Startup: {totals.get('startup', '0.00')} DKK",
        f"Month 1-4: {totals.get('month1to4', '0.00')} DKK",
        f"Month 5-12: {totals.get('month5to12', '0.00')} DKK",
        f"Month 13+: {totals.get('month13plus', '0.00')} DKK",
        "",
        "If you have any questions, please contact info@livingflex.com."
    ])
    body = "\n".join(body_lines)
    return subject, body

def send_via_brevo_api(customer_email, subject, body):
    api_key = get_brevo_api_key()
    if not api_key:
        return False, 'Missing BREVO_API_KEY'

    payload = {
        "sender": {
            "email": os.environ.get('SMTP_FROM', 'order@livingflex.dk').strip(),
            "name": "Flexliving"
        },
        "to": [{"email": customer_email}],
        "subject": subject,
        "textContent": body
    }

    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        json=payload,
        headers={
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json"
        },
        timeout=15
    )

    if response.status_code in (200, 201, 202):
        return True, None

    return False, response.text

@app.route('/send-order-confirmation', methods=['POST'])
def send_order_confirmation():
    try:
        data = request.json or {}
        order = data.get('order') or {}
        totals = data.get('totals') or {}

        customer_email = (order.get('email') or '').strip()
        if not customer_email:
            return jsonify({'error': 'Missing customer email'}), 400

        subject, body = build_order_email(order, totals)

        brevo_success, brevo_error = send_via_brevo_api(customer_email, subject, body)
        if brevo_success:
            return jsonify({'success': True, 'provider': 'brevo'}), 200

        smtp_config = get_smtp_config()
        if smtp_config['missing']:
            return jsonify({
                'error': 'Missing SMTP configuration',
                'missing': smtp_config['missing'],
                'detail': brevo_error or 'Brevo API failed'
            }), 500

        message = EmailMessage()
        message['Subject'] = subject
        message['From'] = smtp_config['smtp_from']
        message['To'] = customer_email
        message.set_content(body)

        if smtp_config['smtp_use_ssl']:
            server = smtplib.SMTP_SSL(smtp_config['smtp_host'], smtp_config['smtp_port'])
        else:
            server = smtplib.SMTP(smtp_config['smtp_host'], smtp_config['smtp_port'])

        with server:
            if smtp_config['smtp_use_tls'] and not smtp_config['smtp_use_ssl']:
                server.starttls()
            server.login(smtp_config['smtp_user'], smtp_config['smtp_password'])
            server.send_message(message)

        return jsonify({'success': True, 'provider': 'smtp'}), 200
    except Exception as e:
        print(f'Error sending order confirmation: {e}')
        return jsonify({'error': 'Server error during email send', 'detail': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, port=port, host='0.0.0.0')

