# coding: utf-8

# DJANGO IMPORTS
from django.contrib import admin

# PROJECT IMPORTS
from apps.blog.models import User, Section, Category, Tag, Entry, EntryLink


class UserOptions(admin.ModelAdmin):
    actions = None

    # List Options
    list_display = ("id", "username", "first_name", "last_name", "email",)
    list_display_links = ("username",)
    search_fields = ("username",)

admin.site.register(User, UserOptions)


class SectionOptions(admin.ModelAdmin):
    actions = None

    # List Options
    list_display = ("id", "name", "slug", "position", "counter_entries",)
    list_display_links = ("name",)
    search_fields = ("name",)

admin.site.register(Section, SectionOptions)


class CategoryOptions(admin.ModelAdmin):
    actions = None

    # List Options
    list_display = ("id", "section", "name", "slug", "position", "counter_entries",)
    list_display_links = ("name",)
    list_filter = ("section",)
    search_fields = ("name",)

admin.site.register(Category, CategoryOptions)


class TagOptions(admin.ModelAdmin):
    actions = None

    # List Options
    list_display = ("id", "name", "slug", "counter_entries",)
    list_display_links = ("name",)
    search_fields = ("name",)

admin.site.register(Tag, TagOptions)


class EntryLinkInline(admin.TabularInline):
    model = EntryLink
    extra = 1
    sortable_field_name = "position"
    classes = ("grp-collapse grp-open",)
    fieldsets = (
        ("", {
            "fields": ("url", "title", "position",),
        }),
    )


class EntryLinkOptions(admin.ModelAdmin):
    actions = None

    # List Options
    list_display = ("id", "entry", "url", "title", "position",)
    list_display_links = ("title",)

admin.site.register(EntryLink, EntryLinkOptions)


class EntryOptions(admin.ModelAdmin):
    actions = None

    # List Options
    list_display = ("id", "section", "category", "title", "status", "date", "sticky", "counter_links", "counter_tags",)
    list_display_links = ("title",)
    list_filter = ("status", "sticky", "category",)
    search_fields = ("title",)
    date_hierarchy = "date"

    raw_id_fields = ("section", "category", "tags",)
    autocomplete_lookup_fields = {
        "fk": ["section", "category"],
        "m2m": ["tags"],
    }

    fieldsets = (
        ("Main", {
            "classes": ("grp-collapse grp-open",),
            "fields": ("title", "status", "date", "sticky",)
        }),
        ("Category & Tags", {
            "classes": ("grp-collapse grp-open",),
            "fields": ("section", "category", "tags",)
        }),
        ("Content", {
            "classes": ("grp-collapse grp-open",),
            "fields": ("summary", "body",)
        })
    )

    # Inlines
    inlines = [EntryLinkInline]

admin.site.register(Entry, EntryOptions)
