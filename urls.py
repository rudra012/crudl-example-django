# coding: utf-8

# DJANGO
from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.conf import settings
from django.views.generic.base import RedirectView

# REST
from rest_framework.authentication import get_authorization_header

# DRF API
from api.urls import router
from api.views import login_view
from apps.blog.models import User

# GRAPHENE
from graphene.contrib.django.views import GraphQLView
from schema import schema


def api_auth_required(view_func):
    def _wrapped_view_func(request, *args, **kwargs):

        auth = get_authorization_header(request).split()
        user = None
        req_token = None
        if not auth or auth[0].lower() != "token":  # Invalid token header
            return HttpResponse("Unauthorized", status=401)
        if len(auth) == 1:  # Invalid token header. No credentials provided
            return HttpResponse("Unauthorized", status=401)
        elif len(auth) > 2:  # Invalid token header. Token string should not contain spaces
            return HttpResponse("Unauthorized", status=401)
        try:
            req_token = auth[1].decode()
        except UnicodeError:  # Invalid token header. Token string should not contain invalid characters
            return HttpResponse("Unauthorized", status=401)

        try:
            user = User.objects.get(token=req_token)
        except User.DoesNotExist:  # Invalid token
            return HttpResponse("Unauthorized", status=401)
        if not user.is_active:  # User inactive or deleted
            return HttpResponse("Unauthorized", status=401)

        return view_func(request, *args, **kwargs)
    return _wrapped_view_func


urlpatterns = [
    # ADMIN
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/', admin.site.urls),
    # CRUDL
    url(r'^crudl-rest/', TemplateView.as_view(template_name="crudl-admin-rest/index.html"), {'crudl_js': settings.CRUDL_JS, 'crudl_css': settings.CRUDL_CSS}),
    url(r'^crudl-graphql/', TemplateView.as_view(template_name="crudl-admin-graphql/index.html"), {'crudl_js': settings.CRUDL_JS, 'crudl_css': settings.CRUDL_CSS}),
    # DRF
    url(r'^rest-api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^rest-api/login/', login_view),
    url(r"^rest-api/", include(router.urls)),
    # GRAPHQL
    url(r'^graphql-api', csrf_exempt(api_auth_required(GraphQLView.as_view(schema=schema)))),
    url(r'^graphiql', include('django_graphiql.urls')),
    # INDEX
    url(r'^$', RedirectView.as_view(url='crudl-rest/', permanent=False), name='index')
]
urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
