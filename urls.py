# coding: utf-8

# PYTHON
import json

# DJANGO
from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.utils.translation import ugettext_lazy as _

# REST
from rest_framework.authtoken import views
from rest_framework.authtoken.models import Token
from rest_framework.authentication import get_authorization_header
from rest_framework import exceptions

# DRF API
from api.urls import router

# GRAPHENE
from graphene.contrib.django.views import GraphQLView
from schema import schema


def api_auth_required(view_func):
    def _wrapped_view_func(request, *args, **kwargs):

        auth = get_authorization_header(request).split()
        token = None
        req_token = None
        response_data = {}
        if not auth or auth[0].lower() != "token":
            msg = _('Invalid token header.')
            return HttpResponse("Unauthorized", status=401)
        if len(auth) == 1:
            msg = _('Invalid token header. No credentials provided.')
            return HttpResponse("Unauthorized", status=401)
        elif len(auth) > 2:
            msg = _('Invalid token header. Token string should not contain spaces.')
            return HttpResponse("Unauthorized", status=401)
        try:
            req_token = auth[1].decode()
        except UnicodeError:
            msg = _('Invalid token header. Token string should not contain invalid characters.')
            return HttpResponse("Unauthorized", status=401)

        try:
            token = Token.objects.select_related('user').get(key=req_token)
        except Token.DoesNotExist:
            msg = _('Invalid token.')
            return HttpResponse("Unauthorized", status=401)
        if not token.user.is_active:
            msg = _('User inactive or deleted.')
            return HttpResponse("Unauthorized", status=401)

        return view_func(request, *args, **kwargs)
    return _wrapped_view_func


urlpatterns = [
    # ADMIN
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/', admin.site.urls),
    # CRUDL
    url(r'^crudl-rest/', TemplateView.as_view(template_name="crudl-admin-rest/index.html")),
    url(r'^crudl-graphql/', TemplateView.as_view(template_name="crudl-admin-graphql/index.html")),
    # DRF
    url(r'^rest-api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^rest-api/api-token-auth/', views.obtain_auth_token),
    url(r"^rest-api/", include(router.urls)),
    # GRAPHQL
    url(r'^graphql-api', csrf_exempt(api_auth_required(GraphQLView.as_view(schema=schema)))),
    url(r'^graphiql', include('django_graphiql.urls')),
]
urlpatterns += staticfiles_urlpatterns()
