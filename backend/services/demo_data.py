from models import db
from models.user import User
from models.customer import Customer
from models.product import Product
from models.order import Order, OrderItem
from datetime import datetime, timedelta
import random

def seed_demo_data():
    # Create users
    if not User.query.filter_by(email='admin@vtc.com').first():
        admin = User(email='admin@vtc.com', role='admin', name='Admin User')
        admin.set_password('admin123')
        db.session.add(admin)

    if not User.query.filter_by(email='staff@vtc.com').first():
        staff = User(email='staff@vtc.com', role='staff', name='Staff User')
        staff.set_password('staff123')
        db.session.add(staff)

    # Create products
    products_data = [
        ('250ml PET Bottle', 'PET Bottles', 2.50, 5000),
        ('500ml PET Bottle', 'PET Bottles', 4.00, 4500),
        ('1L PET Bottle', 'PET Bottles', 6.50, 3000),
        ('2L PET Bottle', 'PET Bottles', 9.00, 2500),
        ('5L Water Jar', 'Water Bottles', 18.00, 1500),
        ('Oil Bottle 1L', 'Oil Bottles', 8.50, 2000),
        ('Oil Bottle 5L', 'Oil Bottles', 22.00, 1200),
        ('Pharma Bottle 100ml', 'Pharma Bottles', 3.50, 3500),
        ('Pharma Bottle 200ml', 'Pharma Bottles', 5.50, 3000),
        ('Cosmetic Spray Bottle', 'Cosmetic Bottles', 12.00, 1800),
        ('Wide Mouth Jar 500g', 'Plastic Containers', 7.50, 2200),
        ('Wide Mouth Jar 1kg', 'Plastic Containers', 11.00, 1800),
        ('Juice Bottle 300ml', 'PET Bottles', 5.00, 2800),
        ('Transparent PET Container', 'Plastic Containers', 9.50, 2000),
        ('Custom PET Bottle', 'Custom Packaging', 15.00, 1000),
    ]

    if Product.query.count() == 0:
        for name, cat, price, stock in products_data:
            p = Product(name=name, category=cat, price=price, stock_quantity=stock)
            db.session.add(p)

    # Create 20 demo customers
    customer_data = [
        ('Rajesh Kumar', 'Kumar Packaging Ltd', '9876543210', 'rajesh@kumar.com', 'Mumbai, MH', 'GST001'),
        ('Priya Sharma', 'Sharma Bottles Pvt Ltd', '9876543211', 'priya@sharma.com', 'Delhi, DL', 'GST002'),
        ('Amit Patel', 'Patel Plastics', '9876543212', 'amit@patel.com', 'Ahmedabad, GJ', 'GST003'),
        ('Sunita Verma', 'Verma Traders', '9876543213', 'sunita@verma.com', 'Pune, MH', 'GST004'),
        ('Vikram Singh', 'Singh Enterprises', '9876543214', 'vikram@singh.com', 'Jaipur, RJ', 'GST005'),
        ('Kavita Reddy', 'Reddy Packaging', '9876543215', 'kavita@reddy.com', 'Hyderabad, TS', 'GST006'),
        ('Mohan Das', 'Das Industries', '9876543216', 'mohan@das.com', 'Chennai, TN', 'GST007'),
        ('Anita Joshi', 'Joshi Plastics Co', '9876543217', 'anita@joshi.com', 'Bengaluru, KA', 'GST008'),
        ('Suresh Nair', 'Nair Brothers', '9876543218', 'suresh@nair.com', 'Kochi, KL', 'GST009'),
        ('Deepika Gupta', 'Gupta Wholesale', '9876543219', 'deepika@gupta.com', 'Lucknow, UP', 'GST010'),
        ('Ravi Mehta', 'Mehta Plastic Works', '9876543220', 'ravi@mehta.com', 'Surat, GJ', 'GST011'),
        ('Pooja Chauhan', 'Chauhan Containers', '9876543221', 'pooja@chauhan.com', 'Vadodara, GJ', 'GST012'),
        ('Sandeep Yadav', 'Yadav Packaging', '9876543222', 'sandeep@yadav.com', 'Patna, BR', 'GST013'),
        ('Meena Tiwari', 'Tiwari Plastic Mart', '9876543223', 'meena@tiwari.com', 'Bhopal, MP', 'GST014'),
        ('Arun Kumar', 'Kumar Plastic Hub', '9876543224', 'arun@kumar2.com', 'Indore, MP', 'GST015'),
        ('Geeta Pandey', 'Pandey Bottles', '9876543225', 'geeta@pandey.com', 'Varanasi, UP', 'GST016'),
        ('Rohit Shah', 'Shah Packaging Solutions', '9876543226', 'rohit@shah.com', 'Rajkot, GJ', 'GST017'),
        ('Shruti Mishra', 'Mishra Plastic Depot', '9876543227', 'shruti@mishra.com', 'Nagpur, MH', 'GST018'),
        ('Vijay Thakur', 'Thakur Industries', '9876543228', 'vijay@thakur.com', 'Chandigarh, CH', 'GST019'),
        ('Nisha Agarwal', 'Agarwal Plastics Pvt', '9876543229', 'nisha@agarwal.com', 'Agra, UP', 'GST020'),
    ]

    if Customer.query.count() == 0:
        for name, company, phone, email, address, gst in customer_data:
            c = Customer(
                customer_name=name,
                company_name=company,
                phone=phone,
                email=email,
                address=address,
                gst_number=gst,
                phone_verified=True,
                email_verified=True
            )
            db.session.add(c)

    db.session.commit()

    # Create 5 demo orders
    if Order.query.count() == 0:
        customers = Customer.query.limit(5).all()
        products = Product.query.all()
        statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Pending']
        for i, cust in enumerate(customers):
            order = Order(
                customer_id=cust.id,
                order_date=datetime.utcnow() - timedelta(days=i*2),
                status=statuses[i]
            )
            db.session.add(order)
            db.session.flush()
            total = 0
            selected = random.sample(products, random.randint(2, 4))
            for prod in selected:
                qty = random.randint(10, 100)
                item = OrderItem(
                    order_id=order.order_id,
                    product_id=prod.product_id,
                    quantity=qty,
                    price=prod.price
                )
                total += qty * prod.price
                db.session.add(item)
            order.total_amount = round(total, 2)
        db.session.commit()
