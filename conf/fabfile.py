# coding: utf-8

# PYTHON IMPORTS
import os
import sys
import random

# FABRIC IMPORTS
from fabric.contrib import django

# PATH
BASE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_PATH = os.path.dirname(BASE_PATH)
sys.path.append(BASE_PATH)
sys.path.append(PROJECT_PATH)

# DJANGO
django.settings_module('settings')
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.exceptions import ObjectDoesNotExist
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# PROJECT
from apps.blog.models import Category, Tag, Entry, EntryLink

# FAKER
from faker import Factory
faker = Factory.create()


def create_users():
    user1 = User.objects.create_superuser("patrick", "patrick@vonautomatisch.at", "crudl")
    user1.first_name = u"Patrick"
    user1.last_name = u"Kranzlmüller"
    user1.save()
    user2 = User.objects.create_superuser("axel", "axel@vonautomatisch.at", "crudl")
    user2.first_name = u"Axel"
    user2.last_name = u"Swoboda"
    user2.save()
    user3 = User.objects.create_user("vaclav", "vaclav.mikolasek@gmail.com", "crudl")
    user3.first_name = u"Vaclav"
    user3.last_name = u"Mikolasek"
    user2.is_staff = True
    user3.save()


def create_categories():
    user_list = User.objects.all()
    for item in user_list:
        for i in range(0, random.randint(300, 500)):
            name = faker.city()
            slug = slugify(name)
            try:
                Category.objects.get(user=item, name=name)
            except ObjectDoesNotExist:
                Category.objects.create(
                    user=item,
                    name=name,
                    slug=slug,
                    position=i
                )


def create_tags():
    user_list = User.objects.all()
    for item in user_list:
        for i in range(0, random.randint(100, 200)):
            name = faker.state()
            try:
                Tag.objects.get(user=item, name=name)
            except ObjectDoesNotExist:
                Tag.objects.create(
                    user=item,
                    name=name
                )


def create_entries():
    user_list = User.objects.all()
    for item in user_list:
        for i in range(0, random.randint(10, 20)):
            status = random.randint(0, 1)
            category = Category.objects.filter(user=item).order_by('?')[0]
            e = Entry.objects.create(
                user=item,
                title=faker.name(),
                date=faker.date(),
                sticky=faker.boolean(),
                status="%s" % (status),
                category=category,
                body=faker.text()
            )
            for x in range(0, random.randint(0, 3)):
                tag = Tag.objects.filter(user=item).order_by('?')[0]
                e.tags.add(tag)
            for x in range(0, random.randint(0, 3)):
                EntryLink.objects.create(
                    entry=e,
                    url=faker.url(),
                    title=faker.name(),
                    position=x
                )


def init():
    create_users()
    create_categories()
    create_tags()
    create_entries()


def delete_categories():
    Category.objects.all().delete()


def delete_tags():
    Tag.objects.all().delete()


def delete_entries():
    Entry.objects.all().delete()


def delete_all():
    Entry.objects.all().delete()
    Category.objects.all().delete()
    Tag.objects.all().delete()
