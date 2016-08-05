# coding: utf-8

# PYTHON IMPORTS
from collections import OrderedDict

# REST IMPORTS
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = None

    def paginate_queryset(self, queryset, request, view=None):
        self.total = None
        if view is not None:
            try:
                self.total = view.get_queryset().count()
            except:
                pass
        return super(StandardResultsSetPagination, self).paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('total', self.total),
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))
