# coding: utf-8

# REST IMPORTS
from rest_framework import routers

# API IMPORTS
from api.views import *  # NOQA

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, base_name="api_users")
router.register(r'sections', SectionViewSet, base_name="api_sections")
router.register(r'categories', CategoryViewSet, base_name="api_categories")
router.register(r'tags', TagViewSet, base_name="api_tags")
router.register(r'entries', EntryViewSet, base_name="api_entries")
router.register(r'entrylinks', EntryLinkViewSet, base_name="api_entry_links")
