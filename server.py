from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from whitenoise import WhiteNoise
import os
import uuid
import smtplib
import json
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
PRODUCTS_FILE = os.path.join(os.path.dirname(__file__), 'products.json')
ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'orders.json')
COMPLETED_ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'completed_orders.json')

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def read_products():
    if not os.path.exists(PRODUCTS_FILE):
        return []
    try:
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as handle:
            data = json.load(handle)
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f'Error reading products file: {e}')
        return []

def write_products(products):
    try:
        with open(PRODUCTS_FILE, 'w', encoding='utf-8') as handle:
            json.dump(products, handle, ensure_ascii=True, indent=2)
    except Exception as e:
        print(f'Error writing products file: {e}')
        raise

def read_orders(path):
    if not os.path.exists(path):
        return []
    try:
        with open(path, 'r', encoding='utf-8') as handle:
            data = json.load(handle)
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f'Error reading orders file: {e}')
        return []

def write_orders(path, orders):
    try:
        with open(path, 'w', encoding='utf-8') as handle:
            json.dump(orders, handle, ensure_ascii=True, indent=2)
    except Exception as e:
        print(f'Error writing orders file: {e}')
        raise

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

@app.route('/products', methods=['GET'])
def get_products():
    products = read_products()
    return jsonify({'products': products}), 200

@app.route('/products', methods=['POST'])
def save_products():
    data = request.json or {}
    products = data.get('products')
    if not isinstance(products, list):
        return jsonify({'error': 'Invalid products payload'}), 400
    try:
        write_products(products)
        return jsonify({'success': True, 'count': len(products)}), 200
    except Exception as e:
        return jsonify({'error': 'Server error during product save', 'detail': str(e)}), 500

@app.route('/orders', methods=['GET'])
def get_orders():
    orders = read_orders(ORDERS_FILE)
    return jsonify({'orders': orders}), 200

@app.route('/orders', methods=['POST'])
def save_orders():
    data = request.json or {}
    orders = data.get('orders')
    if not isinstance(orders, list):
        return jsonify({'error': 'Invalid orders payload'}), 400
    try:
        write_orders(ORDERS_FILE, orders)
        return jsonify({'success': True, 'count': len(orders)}), 200
    except Exception as e:
        return jsonify({'error': 'Server error during orders save', 'detail': str(e)}), 500

@app.route('/completed-orders', methods=['GET'])
def get_completed_orders():
    orders = read_orders(COMPLETED_ORDERS_FILE)
    return jsonify({'orders': orders}), 200

@app.route('/completed-orders', methods=['POST'])
def save_completed_orders():
    data = request.json or {}
    orders = data.get('orders')
    if not isinstance(orders, list):
        return jsonify({'error': 'Invalid completed orders payload'}), 400
    try:
        write_orders(COMPLETED_ORDERS_FILE, orders)
        return jsonify({'success': True, 'count': len(orders)}), 200
    except Exception as e:
        return jsonify({'error': 'Server error during completed orders save', 'detail': str(e)}), 500

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
    subject = f"Ordrebekræftelse - LivingFlex {order_id}"
    created_at = order.get('createdAt') or ''
    created_at_text = ''
    if created_at:
        try:
            created_at_text = datetime.fromisoformat(created_at.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M')
        except ValueError:
            created_at_text = created_at

    customer_name = order.get('name', '').strip()
    greeting_name = customer_name or 'kunde'
    address = order.get('address', '').strip() or 'Ikke angivet'
    postal_code = (order.get('postalCode') or '').strip()
    city = (order.get('city') or '').strip()
    if postal_code or city:
        address = ", ".join([part for part in [address, postal_code, city] if part])
    installation_week = order.get('installationWeek', '').strip() or 'Ikke angivet'
    startup_total = totals.get('startup', '0.00')
    monthly_total = totals.get('month1to4', '0.00')

    body_lines = [
        f"Kære {greeting_name},",
        "",
        "Tak for din bestilling hos LivingFlex i samarbejde med Nimastay.",
        "",
        "Din møbelpakke er nu sat i gang, og vi er i gang med at planlægge levering og opsætning af din bolig.",
        "",
        "Overblik over din bestilling",
        "",
        "Installationsadresse",
        address,
        "",
        "Ønsket installationsuge",
        installation_week,
        "",
        "Setup & levering (engangsbetaling)",
        f"{startup_total} DKK",
        "(Inkl. levering, indbæring og montering)",
        "",
        "Månedlig leje",
        f"{monthly_total} DKK",
        "",
        "Følgende elementer indgår i indretningen:",
        "",
        format_order_items(order),
        "",
        f"Dit ordrenummer er: {order_id}",
        "",
        "",
        "Næste skridt",
        "",
        "En fra LivingFlex-teamet kontakter dig snarest for at bekræfte leveringsdato, adgang og de sidste praktiske detaljer.",
        "",
        "Du kan trygt læne dig tilbage.",
        "Vi sørger for levering, indbæring og montering – og en bolig, der står klar og præsentabel til udlejning fra dag ét.",
        "",
        "Har du spørgsmål i mellemtiden, er du altid velkommen til at svare direkte på denne mail.",
        "",
        "Vi glæder os til at gøre din bolig klar.",
        "",
        "Venlig hilsen",
        "- LivingFlex"
    ]
    body = "\n".join(body_lines)
    return subject, body

def send_via_brevo_api(customer_email, subject, body):
    api_key = get_brevo_api_key()
    if not api_key:
        return False, 'Missing BREVO_API_KEY'

    payload = {
        "sender": {
            "email": os.environ.get('SMTP_FROM', 'order@livingflex.dk').strip(),
            "name": "LivingFlex"
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

