from flask import Blueprint, jsonify
from flask_login import login_required
from models.customer import Customer
from models.product import Product
from models.order import Order
from sqlalchemy import func
from models import db

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    total_customers = Customer.query.count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(func.sum(Order.total_amount)).scalar() or 0
    low_stock = Product.query.filter(Product.stock_quantity < 500).count()
    recent_orders = Order.query.order_by(Order.order_date.desc()).limit(10).all()
    return jsonify({
        'total_customers': total_customers,
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'low_stock_products': low_stock,
        'recent_orders': [o.to_dict() for o in recent_orders]
    })
