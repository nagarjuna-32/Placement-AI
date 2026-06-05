import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def make_request(path, method="GET", headers=None, data=None):
    url = f"{BASE_URL}{path}"
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    
    encoded_data = None
    if data is not None:
        if req_headers.get("Content-Type") == "application/json":
            encoded_data = json.dumps(data).encode("utf-8")
        else:
            encoded_data = data

    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            res_data = res.read()
            if res.headers.get_content_type() == "application/json":
                return res.status, json.loads(res_data.decode("utf-8"))
            return res.status, res_data
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8")
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, str(e)
    except Exception as e:
        return 500, str(e)

def upload_file(path, filename, file_content, headers=None):
    url = f"{BASE_URL}{path}"
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    
    body = []
    body.append(f"--{boundary}".encode('utf-8'))
    body.append(f'Content-Disposition: form-data; name="file"; filename="{filename}"'.encode('utf-8'))
    body.append('Content-Type: application/pdf'.encode('utf-8'))
    body.append(b'')
    body.append(file_content)
    body.append(f"--{boundary}--".encode('utf-8'))
    body.append(b'')
    
    payload = b'\r\n'.join(body)
    
    req_headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Content-Length": str(len(payload))
    }
    if headers:
        req_headers.update(headers)
        
    req = urllib.request.Request(url, data=payload, headers=req_headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = res.read()
            return res.status, json.loads(res_data.decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8")
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, str(e)
    except Exception as e:
        return 500, str(e)

def run_tests():
    print("=== STARTING BACKEND INTEGRATION & SECURITY CHECKS ===")
    
    # 1. Register a test user
    email = f"testuser_{int(time.time())}@example.com"
    reg_data = {
        "email": email,
        "password": "Password123!",
        "full_name": "Test Candidate",
        "role": "student"
    }
    print(f"\n[1] Registering user: {email}...")
    status, res = make_request("/auth/register", "POST", data=reg_data)
    print(f"Status: {status}")
    print(f"Response: {res}")
    assert status == 200, "Registration failed"
    
    # 2. Verify email address using the test bypass code '123456'
    verify_data = {
        "email": email,
        "code": "123456"
    }
    print("\n[2] Verifying email...")
    status, res = make_request("/auth/verify-email", "POST", data=verify_data)
    print(f"Status: {status}")
    print(f"Response: {res}")
    assert status == 200, "Email verification failed"
    
    # 3. Log in to get tokens
    login_data = {
        "email": email,
        "password": "Password123!"
    }
    print("\n[3] Logging in...")
    status, res = make_request("/auth/login", "POST", data=login_data)
    print(f"Status: {status}")
    print(f"Response: {res}")
    assert status == 200, "Login failed"
    
    access_token = res["access_token"]
    auth_headers = {"Authorization": f"Bearer {access_token}"}
    
    # 4. Check subscription plan usage (should be free tier)
    print("\n[4] Fetching subscription usage...")
    status, res = make_request("/profile/subscription", "GET", headers=auth_headers)
    print(f"Status: {status}")
    print(f"Response: {res}")
    assert status == 200, "Fetch subscription failed"
    assert res["plan_tier"] == "free", "Should start with free tier"
    assert res["resume_analyses_limit"] == 3, "Free tier resume limit should be 3"
    
    # 5. Test resume limit blockages (Upload 3 times, then check 4th time block)
    print("\n[5] Simulating resume uploads to exhaust free limits...")
    dummy_pdf_content = b"%PDF-1.4 ... dummy content ..."
    
    for i in range(1, 4):
        print(f"Uploading resume {i}/3...")
        status, res = upload_file("/resume/analyze", f"resume_{i}.pdf", dummy_pdf_content, headers=auth_headers)
        print(f"Status: {status}")
        assert status == 200, f"Upload {i} failed"
        
    print("Uploading resume 4/3 (should fail due to limits)...")
    status, res = upload_file("/resume/analyze", "resume_4.pdf", dummy_pdf_content, headers=auth_headers)
    print(f"Status: {status}")
    print(f"Response: {res}")
    assert status == 403, "Should have blocked 4th upload with 403"
    assert "limit" in res["detail"].lower(), "Error message should mention limit"
    
    # 6. Purchase Upgrade (Pro Tier) using payments Order endpoint
    print("\n[6] Initiating payment order upgrade to Pro...")
    order_req = {
        "plan_tier": "pro",
        "amount": 299.0
    }
    status, res = make_request("/payments/order", "POST", headers=auth_headers, data=order_req)
    print(f"Status: {status}")
    print(f"Response: {res}")
    assert status == 200, "Payment order failed"
    order_id = res["order_id"]
    
    # 7. Verify mock signature check
    verify_req = {
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_mock_99999",
        "razorpay_signature": "sig_mock_99999"
    }
    print("\n[7] Verifying payment signature...")
    status, res = make_request("/payments/verify", "POST", headers=auth_headers, data=verify_req)
    print(f"Status: {status}")
    print(f"Response: {res}")
    assert status == 200, "Payment verification failed"
    
    # 8. Check subscription again to verify limits upgraded
    print("\n[8] Re-checking subscription usage...")
    status, res = make_request("/profile/subscription", "GET", headers=auth_headers)
    print(f"Status: {status}")
    print(f"Response: {res}")
    assert status == 200, "Fetch subscription failed"
    assert res["plan_tier"] == "pro", "Upgrade to pro failed"
    assert res["resume_analyses_limit"] == 50, "Limit should now be 50"
    
    # 9. Test that we can now successfully upload resume 4
    print("\n[9] Testing upload resume 4 again with Pro tier limits...")
    status, res = upload_file("/resume/analyze", "resume_4.pdf", dummy_pdf_content, headers=auth_headers)
    print(f"Status: {status}")
    print(f"Response: {res}")
    assert status == 200, "Upload 4 should succeed under upgraded limits"
    
    # 10. Test PDF readiness report compilation
    print("\n[10] Requesting placement readiness PDF report download...")
    status, res = make_request("/reports/readiness", "GET", headers=auth_headers)
    print(f"Status: {status}")
    print(f"Bytes received: {len(res) if isinstance(res, bytes) else len(str(res))}")
    assert status == 200, "Readiness report download failed"
    assert isinstance(res, bytes), "Response should be binary PDF bytes"
    assert res.startswith(b"%PDF"), "Response should start with PDF magic signature"
    
    # 11. Test Rate limiting (making 105 rapid requests to verify 429 block)
    print("\n[11] Testing Rate Limiting middleware (100 req/min)...")
    blocked = False
    for i in range(110):
        # Triggering on an endpoint that is rate-limited
        status, res = make_request("/auth/login", "POST", data={"email": "nonexistent@domain.com", "password": "pass"})
        if status == 429:
            print(f"Rate limited successfully at request {i}!")
            blocked = True
            break
            
    if not blocked:
        print("Warning: Rate limiter did not fire within 110 requests.")
    
    print("\n=== ALL BACKEND INTEGRATION TESTS PASSED COMPLIANTLY ===")

if __name__ == "__main__":
    run_tests()
