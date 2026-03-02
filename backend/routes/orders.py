from flask import Blueprint, request, jsonify
from flask_login import login_required
from models import db
from models.order import Order, OrderItem
from models.product import Product
from models.customer import Customer

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders', methods=['GET'])
@login_required
def get_orders():
    orders = Order.query.order_by(Order.order_date.desc()).all()
    return jsonify([o.to_dict() for o in orders])

@orders_bp.route('/create_order', methods=['POST'])
@login_required
def create_order():
    data = request.get_json()
    customer_id = data.get('customer_id')
    items = data.get('items', [])
    if not customer_id or not items:
        return jsonify({'success': False, 'message': 'Customer and items required'}), 400
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'success': False, 'message': 'Customer not found'}), 404
    order = Order(customer_id=customer_id, status='Pending')
    db.session.add(order)
    db.session.flush()
    total = 0.0
    for item in items:
        product = Product.query.get(item['product_id'])
        if not product:
            continue
        qty = int(item['quantity'])
        price = float(product.price)
        if product.stock_quantity < qty:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Insufficient stock for {product.name}'}), 400
        product.stock_quantity -= qty
        oi = OrderItem(
            order_id=order.order_id,
            product_id=product.product_id,
            quantity=qty,
            price=price
        )
        db.session.add(oi)
        total += qty * price
    order.total_amount = round(total, 2)
    db.session.commit()
    return jsonify({'success': True, 'order_id': order.order_id, 'order': order.to_dict()})

@orders_bp.route('/orders/<int:oid>', methods=['PUT'])
@login_required
def update_order_status(oid):
    o = Order.query.get_or_404(oid)
    data = request.get_json()
    o.status = data.get('status', o.status)
    db.session.commit()
    return jsonify({'success': True, 'order': o.to_dict()})

@orders_bp.route('/invoice/<int:order_id>', methods=['GET'])
@login_required
def get_invoice(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(order.to_dict())
