# coding: utf-8

# PYTHON IMPORTS
import os

# DJANGO IMPORTS
from django.contrib.auth.models import User
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.text import slugify
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

# CHOICES
STATUS_CHOICES = (
    ("0", u"Draft"),
    ("1", u"Online"),
)


class Category(models.Model):
    """
    Category
    """

    user = models.ForeignKey(User, verbose_name="User", blank=True, null=True, related_name="categories")
    name = models.CharField(u"Name", max_length=200)  # FIXME: unique for user?
    slug = models.SlugField(u"Slug", max_length=100, db_index=True, blank=True)
    position = models.PositiveIntegerField(u"Position", blank=True, null=True)

    class Meta:
        verbose_name = u"Category"
        verbose_name_plural = u"Categories"
        ordering = ("user", "position",)

    def __unicode__(self):
        return u"%s" % (self.name)

    def save(self, *args, **kwargs):
        """
        Slug should be set with the frontend/admin.
        """
        if not self.slug:
            self.slug = slugify(self.name)
        super(Category, self).save(*args, **kwargs)

    @staticmethod
    def autocomplete_search_fields():
        return ("id__iexact", "name__icontains",)


class Tag(models.Model):
    """
    Tag
    """

    user = models.ForeignKey(User, verbose_name="User", blank=True, null=True, related_name="tags")
    name = models.CharField(u"Name", max_length=200)  # FIXME: unique for user?
    slug = models.SlugField(u"Slug", max_length=100, blank=True)

    class Meta:
        verbose_name = u"Tag"
        verbose_name_plural = u"Tags"
        ordering = ("user", "slug",)

    def __unicode__(self):
        return u"%s" % (self.name)

    def save(self, *args, **kwargs):
        """
        Slug is automatically being set when saving the object.
        """
        self.slug = slugify(self.name)
        super(Tag, self).save(*args, **kwargs)

    @staticmethod
    def autocomplete_search_fields():
        return ("id__iexact", "name__icontains",)


class Entry(models.Model):
    """
    Blog Entry
    """

    user = models.ForeignKey(User, verbose_name="User", blank=True, null=True, related_name="entries")
    title = models.CharField(u"Title", max_length=200)
    date = models.DateField(u"Date")
    date_from = models.DateTimeField(u"Date (online from)", blank=True, null=True)
    date_until = models.DateTimeField(u"Date (online until)", blank=True, null=True)  # FIXME: after date_from
    sticky = models.BooleanField(u"Sticky", default=False)
    status = models.CharField(u"Status", max_length=1, choices=STATUS_CHOICES, default="0")
    category = models.ForeignKey(Category, verbose_name=u"Category", related_name="entries")
    tags = models.ManyToManyField(Tag, verbose_name=u"Tags", related_name="entries", blank=True)
    image = models.ImageField(upload_to='uploads/', blank=True, null=True)
    body = models.TextField(u"Body", max_length=3000, blank=True)

    # Internal
    createdate = models.DateField(u"Date (Create)", auto_now_add=True)
    updatedate = models.DateField(u"Date (Update)", auto_now=True)

    class Meta:
        verbose_name = u"Entry"
        verbose_name_plural = u"Entries"
        ordering = ("-date",)

    def __unicode__(self):
        return u"%s" % (self.title)

    @staticmethod
    def autocomplete_search_fields():
        return ("id__iexact", "title__icontains",)


class EntryLink(models.Model):
    """
    Links assigned to an Entry
    """

    entry = models.ForeignKey(Entry, verbose_name=u"Entry", related_name="links")
    url = models.URLField(u"URL", max_length=250)
    title = models.CharField(u"Title", max_length=250)
    description = models.CharField(u"Description", max_length=250, blank=True)
    position = models.PositiveIntegerField(u"Position", blank=True, null=True)

    class Meta:
        verbose_name = u"Link"
        verbose_name_plural = u"Links"
        ordering = ("position",)

    def __unicode__(self):
        return u"%s" % (self.title)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """
    add auth token if
    * is_staff is true and
    * is_active is true
    otherwise, remove the token
    """
    if created and instance.is_staff and instance.is_active:
        Token.objects.create(user=instance)
    if not created:
        if instance.is_staff and instance.is_active:
            Token.objects.get_or_create(user=instance)
        else:
            try:
                Token.objects.get(user=instance).delete()
            except:
                pass
