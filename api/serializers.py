# coding: utf-8

# DJANGO IMPORTS
from django.contrib.auth.models import User

# REST IMPORTS
from rest_framework import serializers, response, status

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
            "is_superuser",
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
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.is_superuser = validated_data.get('is_superuser', instance.is_superuser)
        if password is not None and (user.is_superuser or user == instance.user):
            instance.set_password(password)
        instance.save()
        return instance


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
