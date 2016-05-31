# coding: utf-8

# DJANGO IMPORTS
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

# REST IMPORTS
from rest_framework import serializers

# PROJECT IMPORTS
from django.contrib.auth.models import User
from apps.blog.models import *  # NOQA


class NestedField(serializers.RelatedField):
    def to_internal_value(self, data):
        try:
            return self.get_queryset().get(pk=data)
        except ObjectDoesNotExist:
            self.fail('does_not_exist', pk_value=data)
        except (TypeError, ValueError):
            self.fail('incorrect_type', data_type=type(data).__name__)


class UserField(NestedField):
    def to_representation(self, value):
        return {
            "id": value.pk,
            "username": value.username,
        }


class CategoryField(NestedField):
    def to_representation(self, value):
        return {
            "id": value.pk,
            "name": value.name,
            "slug": value.slug,
        }


class TagField(NestedField):
    def to_representation(self, value):
        return {
            "id": value.pk,
            "name": value.name,
        }


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


class EntryNestedLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryLink
        fields = ('url', 'title', 'position',)


class EntryNestedSerializer(serializers.ModelSerializer):
    user = UserField(queryset=User.objects.all(), many=False, required=True)
    category = CategoryField(queryset=Category.objects.all(), many=False, required=True)
    tags = TagField(queryset=Tag.objects.all(), many=True, required=False)
    links = EntryNestedLinkSerializer(many=True, read_only=True)

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
            "body",
            "links",
        )


class EntryNestedReadWriteSerializer(serializers.ModelSerializer):
    user = UserField(queryset=User.objects.all(), many=False, required=True)
    category = CategorySerializer(many=False, required=True)
    tags = TagSerializer(many=True, required=False)
    links = EntryNestedLinkSerializer(many=True, read_only=True)

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
            "body",
            "links",
        )

    def create(self, validated_data):
        # create category
        category_data = validated_data.pop('category')
        category = Category.objects.create(**category_data)
        validated_data["category"] = category
        # create tags
        tags = []
        tags_data = validated_data.pop('tags', None)
        if tags_data:
            for item in tags_data:
                tag = Tag.objects.create(user=item["user"], name=item["name"], slug=item["slug"])
                tags.append(tag)
        # create and return entry
        entry = Entry.objects.create(**validated_data)
        entry.tags = tags
        entry.save()
        return entry

    def update(self, instance, validated_data):
        # get category/tags
        category_data = validated_data.pop('category', None)
        tags_data = validated_data.pop('tags', None)
        # update instance
        for (key, value) in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        # create/update category
        if category_data:
            if category_data.get("id", None):
                category = Category.objects.get(pk=category_data["id"])
                category.user = category_data.get("user", category.user)
                category.name = category_data.get("name", category.name)
                category.slug = category_data.get("slug", category.slug)
                category.position = category_data.get("position", category.position)
            else:
                category = Category.objects.create(**category_data)
            instance.category = category
        # create/update tags
        tags = []
        if tags_data:
            for item in tags_data:
                if item.get("id", None):
                    tag = Tag.objects.get(pk=item["id"])
                    tag.user = item.get("user", tag.user)
                    tag.name = item.get("name", tag.name)
                    tag.slug = item.get("slug", tag.slug)
                else:
                    tag = Tag.objects.create(user=item["user"], name=item["name"], slug=item["slug"])
                tags.append(tag)
            instance.tags = tags
        # return instance
        instance.save()
        return instance


class EntryLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryLink
        fields = ('id', 'entry', 'url', 'title', 'position',)
