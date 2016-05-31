# coding: utf-8

# DJANGO IMPORTS
from django.contrib import admin

# PROJECT IMPORTS
from apps.blog.models import Category, Tag, Entry, EntryLink


class CategoryOptions(admin.ModelAdmin):
    actions = None

    # List Options
    list_display = ("id", "user", "name", "slug", "position",)
    list_display_links = ("name",)
    list_filter = ("user",)
    search_fields = ("name",)

admin.site.register(Category, CategoryOptions)


class TagOptions(admin.ModelAdmin):
    actions = None

    # List Options
    list_display = ("id", "user", "name", "slug",)
    list_display_links = ("name",)
    list_filter = ("user",)
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


class EntryOptions(admin.ModelAdmin):
    actions = None

    # List Options
    list_display = ("id", "user", "title", "status", "date",)
    list_display_links = ("title",)
    list_filter = ("user",)
    search_fields = ("title",)
    date_hierarchy = "date"

    raw_id_fields = ("category", "tags",)
    autocomplete_lookup_fields = {
        "fk": ["category"],
        "m2m": ["tags"],
    }

    fieldsets = (
        ("Main", {
            "classes": ("grp-collapse grp-open",),
            "fields": ("title", "date", "date_from", "date_until", "user", "status",)
        }),
        ("Category & Tags", {
            "classes": ("grp-collapse grp-open",),
            "fields": ("category", "tags",)
        }),
        ("Content", {
            "classes": ("grp-collapse grp-open",),
            "fields": ("body",)
        })
    )

    # Inlines
    inlines = [EntryLinkInline]

admin.site.register(Entry, EntryOptions)
