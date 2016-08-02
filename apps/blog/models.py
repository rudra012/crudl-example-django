# coding: utf-8

# PYTHON IMPORTS
import binascii
import os

# DJANGO IMPORTS
from django.db import models
from django.utils.text import slugify
from django.core import validators
from django.contrib.auth.hashers import make_password

# CHOICES
STATUS_CHOICES = (
    ("0", u"Draft"),
    ("1", u"Online"),
)


class User(models.Model):
    username = models.CharField(
        u"Username",
        max_length=30, unique=True,
        help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.',
        validators=[validators.RegexValidator(r'^[\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', 'invalid')],
        error_messages={'unique': 'A user with that username already exists.'})
    password = models.CharField(u"Password", max_length=128)
    first_name = models.CharField(u"First name", max_length=30, blank=True)
    last_name = models.CharField(u"Last name", max_length=30, blank=True)
    email = models.EmailField(u"Email", blank=True)
    is_staff = models.BooleanField(u"is_staff", default=False)
    is_active = models.BooleanField(u"is_active", default=True)
    date_joined = models.DateTimeField(u"Date (Joined)", auto_now_add=True)
    token = models.CharField(u"Token", max_length=40, blank=True)

    class Meta:
        verbose_name = u"User"
        verbose_name_plural = u"Users"
        ordering = ("username",)

    def __unicode__(self):
        return u"%s" % (self.username)

    def save(self, *args, **kwargs):
        """
        Set token with is_staff/is_active
        """
        if self.is_staff and self.is_active:
            if not self.token:
                self.token = self.set_token()
        else:
            self.token = ""
        super(User, self).save(*args, **kwargs)

    @staticmethod
    def autocomplete_search_fields():
        return ("id__iexact", "username__icontains",)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def set_token(self):
        return binascii.hexlify(os.urandom(20)).decode()

    def is_authenticated(self):
        return True


class Section(models.Model):
    name = models.CharField(u"Name", max_length=100)
    slug = models.SlugField(u"Slug", max_length=100, db_index=True, blank=True)
    position = models.PositiveIntegerField(u"Position", blank=True, null=True)

    class Meta:
        verbose_name = u"Section"
        verbose_name_plural = u"Sections"
        ordering = ("name",)

    def __unicode__(self):
        return u"%s" % (self.name)

    def save(self, *args, **kwargs):
        """
        Slug should be set with the frontend/admin.
        """
        if not self.slug:
            self.slug = slugify(self.name)
        super(Section, self).save(*args, **kwargs)

    @staticmethod
    def autocomplete_search_fields():
        return ("id__iexact", "name__icontains",)

    def counter_categories(self):
        return len(self.entries.all())
    counter_categories.short_description = u"No. Categories"

    def counter_entries(self):
        return len(self.entries.all())
    counter_entries.short_description = u"No. Entries"


class Category(models.Model):
    section = models.ForeignKey(Section, verbose_name=u"Section", related_name="categories")
    name = models.CharField(u"Name", max_length=100)
    slug = models.SlugField(u"Slug", max_length=100, db_index=True, blank=True)
    position = models.PositiveIntegerField(u"Position", blank=True, null=True)

    class Meta:
        verbose_name = u"Category"
        verbose_name_plural = u"Categories"
        ordering = ("section", "name",)

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
        return ("id__iexact", "section__name__icontains", "name__icontains",)

    def related_label(self):
        return u"%s (%s)" % (self.name, self.section.name)

    def counter_entries(self):
        return len(self.entries.all())
    counter_entries.short_description = u"No. Entries"


class Tag(models.Model):
    name = models.CharField(u"Name", max_length=100)
    slug = models.SlugField(u"Slug", max_length=100, db_index=True, blank=True)

    class Meta:
        verbose_name = u"Tag"
        verbose_name_plural = u"Tags"
        ordering = ("name",)

    def __unicode__(self):
        return u"%s" % (self.name)

    def save(self, *args, **kwargs):
        """
        Slug is being set when saving the object.
        """
        self.slug = slugify(self.name)
        super(Tag, self).save(*args, **kwargs)

    @staticmethod
    def autocomplete_search_fields():
        return ("id__iexact", "name__icontains",)

    def counter_entries(self):
        return len(self.entries.all())
    counter_entries.short_description = u"No. Entries"


class Entry(models.Model):
    # main
    title = models.CharField(u"Title", max_length=200)
    status = models.CharField(u"Status", max_length=1, choices=STATUS_CHOICES, default="0")
    date = models.DateField(u"Date")
    sticky = models.BooleanField(u"Sticky", default=False)
    # categories
    section = models.ForeignKey(Section, verbose_name=u"Section", related_name="entries")
    category = models.ForeignKey(Category, verbose_name=u"Category", related_name="entries", blank=True, null=True)
    tags = models.ManyToManyField(Tag, verbose_name=u"Tags", related_name="entries", blank=True)
    # contents
    image = models.ImageField(upload_to='uploads/', blank=True, null=True)
    summary = models.TextField(u"Summary", max_length=500, blank=True)
    body = models.TextField(u"Body", blank=True)
    # author (currently not used)
    owner = models.ForeignKey(User, verbose_name=u"User", related_name="entries", blank=True, null=True)
    locked = models.BooleanField(u"Sticky", default=False)
    # internal
    createdate = models.DateTimeField(u"Date (Create)", auto_now_add=True)
    updatedate = models.DateTimeField(u"Date (Update)", auto_now=True)

    class Meta:
        verbose_name = u"Entry"
        verbose_name_plural = u"Entries"
        ordering = ("-sticky", "-date",)

    def __unicode__(self):
        return u"%s" % (self.title)

    def counter_links(self):
        return len(self.links.all())
    counter_links.short_description = u"No. Links"

    def counter_tags(self):
        return len(self.tags.all())
    counter_tags.short_description = u"No. Tags"


class EntryLink(models.Model):
    entry = models.ForeignKey(Entry, verbose_name=u"Entry", related_name="links")
    url = models.URLField(u"URL", max_length=200)
    title = models.CharField(u"Title", max_length=200)
    description = models.CharField(u"Description", max_length=200, blank=True)
    position = models.PositiveIntegerField(u"Position", blank=True, null=True)

    class Meta:
        verbose_name = u"Link"
        verbose_name_plural = u"Links"
        ordering = ("entry", "title",)

    def __unicode__(self):
        return u"%s" % (self.title)
