import os
import shutil
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

CLOUDINARY_URL = os.getenv("CLOUDINARY_URL", "")
has_cloudinary = False

if CLOUDINARY_URL:
    try:
        import cloudinary
        import cloudinary.uploader
        # Cloudinary automatically configures via the CLOUDINARY_URL env var
        has_cloudinary = True
    except ImportError:
        print("Cloudinary package not installed. Run `pip install cloudinary` to enable.")

def upload_file_to_storage(file: UploadFile, folder: str = "placemate") -> str:
    """
    Uploads an uploaded file to Cloudinary if configured.
    Otherwise, falls back to storing the file on the local filesystem and returning a localhost static link.
    """
    # Rewind file to start before upload/copy
    file.file.seek(0)
    
    if has_cloudinary:
        try:
            result = cloudinary.uploader.upload(
                file.file,
                folder=folder,
                resource_type="auto"
            )
            return result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload failed: {e}. Falling back to local storage.")
            file.file.seek(0)
            
    # Local fallback
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_dir = os.path.join(backend_dir, "static", "uploads", folder)
    os.makedirs(upload_dir, exist_ok=True)
    
    # Clean filename to prevent XSS/injection paths
    safe_filename = os.path.basename(file.filename).replace(" ", "_")
    file_path = os.path.join(upload_dir, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return f"http://127.0.0.1:8000/static/uploads/{folder}/{safe_filename}"
