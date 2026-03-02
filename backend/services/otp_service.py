import random
import string

otp_store = {}

def generate_otp(phone):
    otp = ''.join(random.choices(string.digits, k=6))
    otp_store[phone] = otp
    print(f"\n{'='*40}")
    print(f"OTP for {phone}: {otp}")
    print(f"{'='*40}\n")
    return otp

def verify_otp(phone, otp):
    stored = otp_store.get(phone)
    if stored and stored == otp:
        del otp_store[phone]
        return True
    return False
