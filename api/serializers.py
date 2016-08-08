# coding: utf-8

# DJANGO IMPORTS
from django.contrib.auth.hashers import check_password

# REST IMPORTS
from rest_framework import serializers

# PROJECT IMPORTS
from apps.blog.models import *  # NOQA


class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "is_staff",
            "is_active",
            "date_joined",
            "password"
        )
        read_only_fields = ("date_joined",)
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        if validated_data.get('password'):
            user.set_password(validated_data['password'])
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.get('password', None)
        user = self.context["request"].user
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        # only allow user to set her own password
        if password is not None and user == instance:
            instance.set_password(password)
        instance.save()
        return instance

    def validate_password(self, value):
        if value is not None and len(value) < 4:
            raise serializers.ValidationError("This password is too short. It must contain at least 4 characters.")
        return value

    def validate(self, data):
        is_staff = data.get("is_staff", None)
        is_active = data.get("is_active", None)
        if is_staff is True and is_active is False:
            raise serializers.ValidationError("Staff member requires active user.")
        return data


class SectionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Section
        fields = (
            "id",
            "name",
            "slug",
            "position",
            "counter_categories",
            "counter_entries",
        )


class CategorySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Category
        fields = (
            "id",
            "section",
            "name",
            "slug",
            "position",
            "counter_entries",
        )


class TagSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Tag
        fields = (
            "id",
            "name",
            "slug",
            "counter_entries",
        )


class EntrySerializer(serializers.ModelSerializer):
    status_name = serializers.SerializerMethodField()
    section_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    owner_username = serializers.SerializerMethodField()

    class Meta:
        model = Entry
        fields = (
            "id",
            "title",
            "status",
            "status_name",
            "date",
            "sticky",
            "section",
            "section_name",
            "category",
            "category_name",
            "tags",
            "summary",
            "body",
            "counter_links",
            "counter_tags",
            "owner",
            "owner_username",
            "createdate",
            "updatedate"
        )
        read_only_fields = ("createdate", "updatedate",)

    def get_status_name(self, obj):
        return obj.get_status_display()

    def get_section_name(self, obj):
        return obj.section.name

    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        return ""

    def get_owner_username(self, obj):
        if obj.owner:
            return obj.owner.username
        return ""


class EntryLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryLink
        fields = (
            "id",
            "entry",
            "url",
            "title",
            "position"
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        if username and password:
            try:
                user = User.objects.get(username=username)
                if not check_password(password, user.password):
                    user = None
            except User.DoesNotExist:
                user = None
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                if not user.is_staff:
                    raise serializers.ValidationError('User has no access to crudl.')
            else:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include "username" and "password".')
        attrs['user'] = user
        return attrs
