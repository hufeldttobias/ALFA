# Alfa Mobility - Living Flex

## Setup Instructions

### 1. Install Python Dependencies

First, install the required Python packages:

```bash
pip3 install -r requirements.txt
```

### 2. Start the File Upload Server

The application requires a Flask server to handle image uploads. Start it with:

```bash
python3 server.py
```

The server will run on `http://localhost:5001`

#### Order confirmation emails

The server loads SMTP settings from a `.env` file in the project root:

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=order@livingflex.dk
SMTP_USE_TLS=true
SMTP_USE_SSL=false
BREVO_API_KEY=your-brevo-api-key
```

### 3. Start the Web Server

In a separate terminal, start the web server:

```bash
npm run dev
```

### 4. Access the Application

- Alfa page (unchanged): `http://localhost:3011/index.html`
- Alternate page: `http://localhost:3011/nimastay.html`
- Admin panel: Log in with username `RT` and password `RTAMLF`

## File Structure

- `index.html` - Main website
- `admin.html` - Admin panel
- `server.py` - Flask server for file uploads
- `uploads/` - Directory where uploaded images are stored (created automatically)

## Notes

- Images are now stored as files in the `uploads/` folder instead of Base64 in localStorage
- This prevents localStorage quota exceeded errors
- Old products with Base64 images will still work, but new products will use file storage

