from flask import Blueprint, request, jsonify
from flask_login import login_required
from models import db
from models.customer import Customer
from services.otp_service import generate_otp, verify_otp
import pandas as pd
import io

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/customers', methods=['GET'])
@login_required
def get_customers():
    search = request.args.get('search', '')
    query = Customer.query
    if search:
        query = query.filter(
            Customer.customer_name.ilike(f'%{search}%') |
            Customer.company_name.ilike(f'%{search}%') |
            Customer.phone.ilike(f'%{search}%')
        )
    customers = query.order_by(Customer.created_at.desc()).all()
    return jsonify([c.to_dict() for c in customers])

@customers_bp.route('/customers', methods=['POST'])
@login_required
def add_customer():
    data = request.get_json()
    phone = data.get('phone')
    email = data.get('email')
    if Customer.query.filter_by(phone=phone).first():
        return jsonify({'success': False, 'message': 'Phone already exists'}), 400
    if email and Customer.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 400
    c = Customer(
        customer_name=data['customer_name'],
        company_name=data.get('company_name'),
        phone=phone,
        email=email,
        address=data.get('address'),
        gst_number=data.get('gst_number'),
        phone_verified=data.get('phone_verified', False),
        email_verified=data.get('email_verified', False)
    )
    db.session.add(c)
    db.session.commit()
    return jsonify({'success': True, 'customer': c.to_dict()})

@customers_bp.route('/customers/<int:cid>', methods=['PUT'])
@login_required
def update_customer(cid):
    c = Customer.query.get_or_404(cid)
    data = request.get_json()
    c.customer_name = data.get('customer_name', c.customer_name)
    c.company_name = data.get('company_name', c.company_name)
    c.phone = data.get('phone', c.phone)
    c.email = data.get('email', c.email)
    c.address = data.get('address', c.address)
    c.gst_number = data.get('gst_number', c.gst_number)
    db.session.commit()
    return jsonify({'success': True, 'customer': c.to_dict()})

@customers_bp.route('/customers/<int:cid>', methods=['DELETE'])
@login_required
def delete_customer(cid):
    c = Customer.query.get_or_404(cid)
    db.session.delete(c)
    db.session.commit()
    return jsonify({'success': True})

@customers_bp.route('/get_customer/<string:name>', methods=['GET'])
@login_required
def get_customer_by_name(name):
    customers = Customer.query.filter(
        Customer.customer_name.ilike(f'%{name}%') |
        Customer.company_name.ilike(f'%{name}%')
    ).limit(10).all()
    return jsonify([c.to_dict() for c in customers])

@customers_bp.route('/send_otp', methods=['POST'])
@login_required
def send_otp():
    data = request.get_json()
    phone = data.get('phone')
    if not phone:
        return jsonify({'success': False, 'message': 'Phone required'}), 400
    otp = generate_otp(phone)
    return jsonify({'success': True, 'message': f'OTP sent to {phone}', 'otp': otp})

@customers_bp.route('/verify_otp', methods=['POST'])
@login_required
def verify_otp_route():
    data = request.get_json()
    phone = data.get('phone')
    otp = data.get('otp')
    if verify_otp(phone, otp):
        return jsonify({'success': True, 'message': 'OTP verified'})
    return jsonify({'success': False, 'message': 'Invalid OTP'}), 400

@customers_bp.route('/upload_customers', methods=['POST'])
@login_required
def upload_customers():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file uploaded'}), 400
    file = request.files['file']
    if not file.filename.endswith('.xlsx'):
        return jsonify({'success': False, 'message': 'Only .xlsx files accepted'}), 400
    try:
        df = pd.read_excel(io.BytesIO(file.read()))
        added = 0
        skipped = 0
        for _, row in df.iterrows():
            phone = str(row.get('phone', '')).strip()
            email = str(row.get('email', '')).strip()
            if Customer.query.filter_by(phone=phone).first() or Customer.query.filter_by(email=email).first():
                skipped += 1
                continue
            c = Customer(
                customer_name=str(row.get('customer_name', '')),
                company_name=str(row.get('company_name', '')),
                phone=phone,
                email=email,
                address=str(row.get('address', '')),
                gst_number=str(row.get('gst_number', '')),
                phone_verified=False,
                email_verified=False
            )
            db.session.add(c)
            added += 1
        db.session.commit()
        return jsonify({'success': True, 'message': f'Added {added} customers, skipped {skipped} duplicates'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
