# coding: utf-8

# DJANGO IMPORTS
import django_filters

# REST IMPORTS
from rest_framework import viewsets, filters, response, parsers, renderers
from rest_framework.decorators import detail_route
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

# PROJECT IMPORTS
from django.contrib.auth.models import User
from apps.blog.models import *  # NOQA

# SERIALIZERS
from api.serializers import *  # NOQA


class UserFilter(django_filters.FilterSet):
    username = django_filters.CharFilter(name="username", lookup_type="icontains")
    is_staff = django_filters.BooleanFilter(name="is_staff")
    is_active = django_filters.BooleanFilter(name="is_active")

    class Meta:
        model = User
        fields = ("username", "is_staff", "is_active",)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = UserFilter
    ordering_fields = ('id', 'username', 'is_staff', 'is_active', 'date_joined',)

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class CategoryFilter(django_filters.FilterSet):
    user = django_filters.NumberFilter(name="user", lookup_type="exact")
    name = django_filters.CharFilter(name="name", lookup_type="icontains")

    class Meta:
        model = Category
        fields = ("user", "name",)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = CategoryFilter
    ordering_fields = ('id', 'user', 'name', 'slug', 'position',)

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Category.objects.all()
        return Category.objects.filter(user=self.request.user)


class TagFilter(django_filters.FilterSet):
    user = django_filters.NumberFilter(name="user", lookup_type="exact")

    class Meta:
        model = Tag
        fields = ("user",)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = TagFilter
    ordering_fields = ('id', 'user', 'name', 'slug',)

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Tag.objects.all()
        return Tag.objects.filter(user=self.request.user)


class EntryFilter(django_filters.FilterSet):
    date = django_filters.DateFilter(name="date", lookup_type="exact")
    date_lt = django_filters.DateFilter(name="date", lookup_type="lt")
    date_gt = django_filters.DateFilter(name="date", lookup_type="gt")

    class Meta:
        model = Entry
        fields = ("user", "date", "status", "category", "tags",)


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,)
    filter_class = EntryFilter
    search_fields = ('title',)
    ordering_fields = ('id', 'title', 'date', 'category', 'tags',)

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Entry.objects.all()
        return Entry.objects.filter(user=self.request.user)

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
        if self.request.user.is_superuser:
            return EntryLink.objects.all()
        return EntryLink.objects.filter(entry__user=self.request.user)


class ObtainAuthToken(APIView):
    """
    custom obtain auth token class in order to return the token and
    the user (the user is neede for initialvalue with entries)
    """
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user.id})


obtain_auth_token = ObtainAuthToken.as_view()
