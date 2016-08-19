# coding: utf-8
import os

# PATH
BASE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_PATH = os.path.dirname(BASE_PATH)

# CRUDL STATIC
# check if static/crudl is given, otherwise use static/crudl-core
if os.path.exists(os.path.join(BASE_PATH, 'static', 'crudl')):
    CRUDL_JS = "crudl/crudl.js"
    CRUDL_CSS = "crudl/static/themes/crudl-ui/stylesheets/crudl-ui.css"
else:
    CRUDL_JS = "crudl-core/crudl.min.js"
    CRUDL_CSS = "crudl-core/static/themes/crudl-ui/stylesheets/crudl-ui.css"

# ALLOWED HOSTS#
DEBUG = True
ALLOWED_HOSTS = ['*']

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_PATH, 'db.sqlite3'),
    }
}

# Email
ADMINS = ()

# File uploads
FILE_UPLOAD_PERMISSIONS = 0775
MEDIA_ROOT = os.path.join(PROJECT_PATH, 'media')
MEDIA_URL = '/media/'

# Globalization (i18n/l10n)
LANGUAGE_CODE = 'en'

# HTTP
MIDDLEWARE_CLASSES = (
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)
WSGI_APPLICATION = 'wsgi.application'

# Models
INSTALLED_APPS = (
    # DJANGO
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.staticfiles',
    # ADMIN
    'grappelli',
    'django.contrib.admin',
    'crudl-admin-rest',
    'crudl-admin-graphql',
    # APPS
    'corsheaders',
    'rest_framework',
    'apps.blog',
    # GRAPHQL
    'django_graphiql',
    'graphene.contrib.django',
)

# Security
SECRET_KEY = "WirA8o9hjndtF9Vz9DxM"

# URLs
PREPEND_WWW = False
ROOT_URLCONF = 'urls'

# SITES
SITE_ID = 1

# STATICFILES
STATIC_ROOT = os.path.join(PROJECT_PATH, 'static')
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_PATH, 'static'),
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# CORS
CORS_ORIGIN_ALLOW_ALL = True

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_PATH, 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'debug': DEBUG,
            'context_processors': [
                'django.contrib.auth.context_processors.auth',
                'django.template.context_processors.debug',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# APP GRAPPELLI
GRAPPELLI_ADMIN_TITLE = u'crudl example django'
GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS = {
    'auth': {
        'user': ('id__iexact', 'first_name__icontains', 'last_name__icontains', 'username__icontains',)
    }
}

# APP REST FRAMEWORK
REST_FRAMEWORK = {
    'UNICODE_JSON': True,
    'DEFAULT_PAGINATION_CLASS': 'api.pagination.StandardResultsSetPagination',
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    'DEFAULT_MODEL_SERIALIZER_CLASS':
        'rest_framework.serializers.HyperlinkedModelSerializer',

    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.UserRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'user': '10000/day'
    },
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'api.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# APP GRAPHIQL
GRAPHIQL_GRAPHQL_URL = '/graphql-api'
