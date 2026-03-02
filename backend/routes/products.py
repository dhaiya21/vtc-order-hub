from flask import Blueprint, request, jsonify
from flask_login import login_required
from models import db
from models.product import Product

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
@login_required
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])

@products_bp.route('/products', methods=['POST'])
@login_required
def add_product():
    data = request.get_json()
    p = Product(
        name=data['name'],
        category=data.get('category', 'PET Bottles'),
        price=float(data['price']),
        stock_quantity=int(data['stock_quantity'])
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({'success': True, 'product': p.to_dict()})

@products_bp.route('/products/<int:pid>', methods=['PUT'])
@login_required
def update_product(pid):
    p = Product.query.get_or_404(pid)
    data = request.get_json()
    p.name = data.get('name', p.name)
    p.category = data.get('category', p.category)
    p.price = float(data.get('price', p.price))
    p.stock_quantity = int(data.get('stock_quantity', p.stock_quantity))
    db.session.commit()
    return jsonify({'success': True, 'product': p.to_dict()})

@products_bp.route('/products/<int:pid>', methods=['DELETE'])
@login_required
def delete_product(pid):
    p = Product.query.get_or_404(pid)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'success': True})
