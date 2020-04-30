import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    HOST="0.0.0.0"
    DEBUG = False 
    TESTING = False
    CSRF_ENABLED = True


class ProductionConfig(Config):
    DEBUG = False


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    HOST="127.0.0.1"
    DEBUG = True


class TestingConfig(Config):
    TESTING = True