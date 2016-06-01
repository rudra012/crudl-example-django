# coding: utf-8

# DJANGO IMPORTS
from django.contrib.auth.models import User

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
        """
        set hashed password
        """
        user = User.objects.create(**validated_data)
        if validated_data.get('password'):
            user.set_password(validated_data['password'])
            user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Category
        fields = (
            "id",
            "user",
            "name",
            "slug",
            "position"
        )


class TagSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Tag
        fields = (
            "id",
            "user",
            "name",
            "slug"
        )


class EntrySerializer(serializers.ModelSerializer):

    class Meta:
        model = Entry
        fields = (
            "id",
            "user",
            "title",
            "date",
            "date_from",
            "date_until",
            "sticky",
            "status",
            "category",
            "tags",
            "body"
        )


class EntryLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryLink
        fields = ('id', 'entry', 'url', 'title', 'position',)
