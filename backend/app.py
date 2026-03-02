import os
from flask import Flask
from flask_login import LoginManager
from flask_cors import CORS
from config import Config
from models import db
from models.user import User
from routes.auth import auth_bp
from routes.customers import customers_bp
from routes.products import products_bp
from routes.orders import orders_bp
from routes.reports import reports_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs('database', exist_ok=True)
    os.makedirs('uploads', exist_ok=True)

    db.init_app(app)
    CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://localhost:5173'])

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        from flask import jsonify
        return jsonify({'error': 'Unauthorized'}), 401

    app.register_blueprint(auth_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(reports_bp)

    with app.app_context():
        db.create_all()
        from services.demo_data import seed_demo_data
        seed_demo_data()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
