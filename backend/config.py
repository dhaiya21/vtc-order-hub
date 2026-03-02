import os

class Config:
    SECRET_KEY = 'vtc-secret-key-2024'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database/vtc_orders.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = 'uploads'
