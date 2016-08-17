# coding: utf-8

# PYTHON IMPORTS
from distutils.util import strtobool

# DJANGO IMPORTS
import django_filters
from django_filters.filters import BaseInFilter, NumberFilter

# REST IMPORTS
from rest_framework import viewsets, filters, response, parsers, renderers, status
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import get_authorization_header

# PROJECT IMPORTS
from apps.blog.models import *  # NOQA

# SERIALIZERS
from api.serializers import *  # NOQA

BOOLEAN_CHOICES = (('false', 'False'), ('0', 'False'), ('true', 'True'), ('1', 'True'),)


class IDInFilter(BaseInFilter, NumberFilter):
    pass


class UserFilter(django_filters.FilterSet):
    username = django_filters.CharFilter(name="username", lookup_type="icontains")
    is_staff = django_filters.BooleanFilter(name="is_staff")
    is_active = django_filters.BooleanFilter(name="is_active")

    class Meta:
        model = User
        fields = ("id", "username", "is_staff", "is_active",)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = UserFilter
    ordering_fields = ('id', 'username', 'is_staff', 'is_active', 'date_joined',)

    def get_queryset(self):
        return User.objects.all()

    def destroy(self, request, *args, **kwargs):
        return response.Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


class SectionFilter(django_filters.FilterSet):
    id_in = IDInFilter(name="id", lookup_expr="in")
    name = django_filters.CharFilter(name="name", lookup_type="icontains")

    class Meta:
        model = Section
        fields = ("id_in", "name",)


class SectionViewSet(viewsets.ModelViewSet):
    serializer_class = SectionSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = SectionFilter
    ordering_fields = ('id', 'name', 'slug', 'position',)

    def get_queryset(self):
        return Section.objects.all()


class CategoryFilter(django_filters.FilterSet):
    id_in = IDInFilter(name="id", lookup_expr="in")
    section = django_filters.NumberFilter(name="section", lookup_type="exact")
    name = django_filters.CharFilter(name="name", lookup_type="icontains")

    class Meta:
        model = Category
        fields = ("id_in", "section", "name",)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = CategoryFilter
    ordering_fields = ('id', 'section', 'name', 'slug', 'position',)

    def get_queryset(self):
        return Category.objects.all()


class TagFilter(django_filters.FilterSet):
    id_in = IDInFilter(name="id", lookup_expr="in")
    name = django_filters.CharFilter(name="name", lookup_type="icontains")

    class Meta:
        model = Tag
        fields = ("id_in", "name",)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = TagFilter
    ordering_fields = ('id', 'name', 'slug',)

    def get_queryset(self):
        return Tag.objects.all()


class EntryFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(name="title", lookup_type="icontains")
    date = django_filters.DateFilter(name="date", lookup_type="exact")
    date_lt = django_filters.DateFilter(name="date", lookup_type="lt")
    date_gt = django_filters.DateFilter(name="date", lookup_type="gt")
    sticky = django_filters.TypedChoiceFilter(choices=BOOLEAN_CHOICES, coerce=strtobool)
    search_summary = django_filters.CharFilter(name="summary", lookup_type="icontains")

    class Meta:
        model = Entry
        fields = ("status", "date", "sticky", "section", "category", "tags",)


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,)
    filter_class = EntryFilter
    search_fields = ('title',)
    ordering_fields = ('id', 'title', 'date', 'sticky', 'section', 'category', 'tags',)

    def get_queryset(self):
        return Entry.objects.all()

    @detail_route(methods=['get'])
    def links(self, request, *args, **kwargs):
        entry = self.get_object()
        serializer = EntryLinkSerializer(entry.links.all(), many=True)
        return response.Response(serializer.data)


class EntryLinkFilter(django_filters.FilterSet):
    entry = django_filters.NumberFilter(name="entry", lookup_type="exact")

    class Meta:
        model = EntryLink
        fields = ("entry",)


class EntryLinkViewSet(viewsets.ModelViewSet):
    serializer_class = EntryLinkSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = EntryLinkFilter
    ordering_fields = ('id', 'entry', 'title', 'position',)

    def get_queryset(self):
        return EntryLink.objects.all()


class LoginView(APIView):
    """
    custom login view in order to return the token and the user
    """
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        return Response({'token': user.token, 'user': user.id, 'username': user.username})

login_view = LoginView.as_view()
