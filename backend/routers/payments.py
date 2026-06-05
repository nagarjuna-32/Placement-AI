import os
import time
import hmac
import hashlib
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, database, schemas
from routers.auth import get_current_user
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
has_razorpay = False

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    try:
        import razorpay
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        has_razorpay = True
    except ImportError:
        print("Razorpay package not installed. Run `pip install razorpay` to enable.")

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/order", response_model=dict)
def create_payment_order(
    req: schemas.PaymentOrderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    amount_paise = int(req.amount * 100)
    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"rcpt_{current_user.id}_{int(time.time())}",
        "payment_capture": 1
    }
    
    # Default mock order ID for local sandbox mode
    order_id = f"order_mock_{current_user.id}_{int(time.time())}"
    
    if has_razorpay:
        try:
            razorpay_order = client.order.create(data=order_data)
            order_id = razorpay_order.get("id")
        except Exception as e:
            print(f"Razorpay order generation failed: {e}. Falling back to local mock order.")
            
    # Log the payment order creation in DB
    log = models.PaymentLog(
        user_id=current_user.id,
        order_id=order_id,
        amount=req.amount,
        currency="INR",
        status="created",
        plan_tier=req.plan_tier
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    
    return {
        "order_id": order_id,
        "amount": req.amount,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID or "rzp_test_mockkey123"
    }

@router.post("/verify", response_model=dict)
def verify_payment_signature(
    req: schemas.PaymentVerification,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Retrieve local order log
    log = db.query(models.PaymentLog).filter(models.PaymentLog.order_id == req.razorpay_order_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Order record not found.")
        
    is_valid = False
    
    if has_razorpay:
        try:
            # Construct signature payload using HMAC SHA256
            msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
            generated_signature = hmac.new(
                bytes(RAZORPAY_KEY_SECRET, "utf-8"),
                msg.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            
            if generated_signature == req.razorpay_signature:
                is_valid = True
        except Exception as e:
            print(f"Razorpay signature check error: {e}")
    else:
        # Mock validation fallback for local testing
        is_valid = True
        
    if not is_valid:
        log.status = "failed"
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature. Validation failed.")
        
    # Mark payment as captured in database
    log.status = "captured"
    log.payment_id = req.razorpay_payment_id
    
    # Update user plan tier & limits
    current_user.subscription_tier = log.plan_tier
    
    # Update subscription usage limits
    usage = db.query(models.SubscriptionUsage).filter(models.SubscriptionUsage.user_id == current_user.id).first()
    if not usage:
        usage = models.SubscriptionUsage(user_id=current_user.id)
        db.add(usage)
        
    # Adjust plan limits dynamically
    if log.plan_tier == "basic":
        usage.resume_analyses_limit = 10
        usage.interviews_limit = 10
        usage.gd_limit = 10
    elif log.plan_tier == "pro":
        usage.resume_analyses_limit = 50
        usage.interviews_limit = 50
        usage.gd_limit = 50
    elif log.plan_tier == "premium":
        usage.resume_analyses_limit = 9999
        usage.interviews_limit = 9999
        usage.gd_limit = 9999
        
    usage.expiry_date = datetime.utcnow() + timedelta(days=30)
    
    # Log user action activity
    activity = models.UserActivity(
        user_id=current_user.id,
        action_name="payment_success",
        details=f"Purchased plan {log.plan_tier} for amount {log.amount}."
    )
    db.add(activity)
    db.commit()
    
    return {"message": "Payment verified successfully. Plan limits updated.", "status": "success"}
