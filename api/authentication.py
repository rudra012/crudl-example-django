# coding: utf-8
from __future__ import unicode_literals

# DJANGO IMPORTS
from django.utils.translation import ugettext_lazy as _

# REST FRAMEWORK IMPORTS
from rest_framework import exceptions
from rest_framework.authentication import get_authorization_header, BaseAuthentication

# PROJECT IMPORTS
from apps.blog.models import User


class TokenAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        if not auth or auth[0].lower() != b'token':
            return None

        if len(auth) == 1:
            msg = _('Invalid token header. No credentials provided.')
            raise exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = _('Invalid token header. Token string should not contain spaces.')
            raise exceptions.AuthenticationFailed(msg)

        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = _('Invalid token header. Token string should not contain invalid characters.')
            raise exceptions.AuthenticationFailed(msg)

        return self.authenticate_credentials(token)

    def authenticate_credentials(self, key):
        try:
            user = User.objects.get(token=key)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed(_('Invalid token.'))
        if not user.is_active:
            raise exceptions.AuthenticationFailed(_('User inactive or deleted.'))
        if not user.is_staff:
            raise exceptions.AuthenticationFailed(_('Access denied.'))
        return (user, user.token)

    def authenticate_header(self, request):
        return 'Token'
