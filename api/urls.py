# coding: utf-8

# REST IMPORTS
from rest_framework import routers

# API IMPORTS
from api.views import *  # NOQA

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, base_name="api_users")
router.register(r'categories', CategoryViewSet, base_name="api_categories")
router.register(r'tags', TagViewSet, base_name="api_tags")
router.register(r'entries', EntryViewSet, base_name="api_entries")
router.register(r'entries-nested', EntryNestedViewSet, base_name="api_entries_nested")
router.register(r'entries-nested-read-write', EntryNestedReadWriteViewSet, base_name="api_entries_nested_read_write")
router.register(r'entrylinks', EntryLinkViewSet, base_name="api_entry_links")
