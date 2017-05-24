# coding: utf-8

# PYTHON IMPORTS
import operator
from functools import reduce

# GENERAL DJANGO IMPORTS
from django.core.exceptions import ValidationError
from rest_framework.authentication import get_authorization_header
from rest_framework.compat import distinct
from django.utils import six
from django.db import models

# DJANGO IMPORTS
import django_filters

# GRAPHENE IMPORTS
import graphene
from graphene import relay, ObjectType, Field, String, Int, ID, Boolean, List
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.contrib.django.types import DjangoNode, DjangoConnection
from graphql_relay.node.node import from_global_id

# PROJECT IMPORTS
from apps.blog.models import User, Section, Category, Tag, Entry, EntryLink


def getErrors(e):
    # transform django errors to redux errors
    # django: {"key1": [value1], {"key2": [value2]}}
    # redux: ["key1", "value1", "key2", "value2"]
    fields = e.message_dict.keys()
    messages = ['; '.join(m) for m in e.message_dict.values()]
    errors = [i for pair in zip(fields, messages) for i in pair]
    return errors


def get_id_list(value):
    original_id_list = []
    id_list = value.split(",")
    for item in id_list:
        if item:
            try:
                original_id_list.append(from_global_id(item)[1])
            except:
                pass
    return original_id_list


class Connection(DjangoConnection):
    total_count = graphene.Int()
    filtered_count = graphene.Int()

    def resolve_total_count(self, args, info):
        pass

    def resolve_filtered_count(self, args, info):
        return len(self.get_connection_data())


class UserConnection(Connection):
    def resolve_total_count(self, args, info):
        return User.objects.all().count()


class UserNode(DjangoNode):
    original_id = graphene.Int()

    class Meta:
        model = User
        filter_fields = {
            'username': ['icontains'],
            'is_staff': ['exact'],
            'is_active': ['exact']
        }
        filter_order_by = ['id', '-id', 'username', '-username', 'is_staff', '-is_staff', 'is_active', '-is_active' 'date_joined', '-date_joined']

    def resolve_original_id(self, args, info):
        return self.id

    connection_type = UserConnection


class SectionFilter(django_filters.FilterSet):
    id_in = django_filters.MethodFilter()
    name = django_filters.MethodFilter()

    class Meta:
        model = Category
        fields = ("id_in", "name",)
        order_by = ['id', '-id', 'name', '-name', 'slug', '-slug', 'position', '-position']

    def filter_id_in(self, queryset, value):
        return queryset.filter(id__in=get_id_list(value))

    def filter_name(self, queryset, value):
        return queryset.filter(name__icontains=value)


class SectionConnection(Connection):
    def resolve_total_count(self, args, info):
        return Section.objects.all().count()


class SectionNode(DjangoNode):
    connection_type = Connection
    original_id = graphene.Int()
    counter_entries = graphene.Int()

    class Meta:
        model = Section

    def resolve_original_id(self, args, info):
        return self.id

    def resolve_counter_entries(self, args, info):
        return self.counter_entries()

    connection_type = SectionConnection


class CategoryFilter(django_filters.FilterSet):
    id_in = django_filters.MethodFilter()
    section = django_filters.MethodFilter()
    name = django_filters.MethodFilter()
    search = django_filters.MethodFilter()

    class Meta:
        model = Category
        fields = ("id_in", "section", "name",)
        order_by = ['id', '-id', 'section', '-section', 'name', '-name', 'slug', '-slug', 'position', '-position']

    def filter_id_in(self, queryset, value):
        return queryset.filter(id__in=get_id_list(value))

    def filter_section(self, queryset, value):
        return queryset.filter(section=get_section(value))

    def filter_name(self, queryset, value):
        return queryset.filter(name__icontains=value)

    def filter_search(self, queryset, value):
        search_fields = ("name", "section__name",)
        search_terms = value.replace(',', ' ').split()
        if not search_fields or not search_terms:
            return queryset
        orm_lookups = [
            self.construct_search(six.text_type(search_field))
            for search_field in search_fields
        ]
        base = queryset
        for search_term in search_terms:
            queries = [
                models.Q(**{orm_lookup: search_term})
                for orm_lookup in orm_lookups
            ]
            queryset = queryset.filter(reduce(operator.or_, queries))
        return distinct(queryset, base)

    def construct_search(self, field_name):
        return "%s__icontains" % field_name


class CategoryConnection(Connection):
    def resolve_total_count(self, args, info):
        return Category.objects.all().count()


class CategoryNode(DjangoNode):
    connection_type = Connection
    original_id = graphene.Int()
    counter_entries = graphene.Int()

    class Meta:
        model = Category

    def resolve_original_id(self, args, info):
        return self.id

    def resolve_counter_entries(self, args, info):
        return self.counter_entries()

    connection_type = CategoryConnection


class TagFilter(django_filters.FilterSet):
    id_in = django_filters.MethodFilter()
    name = django_filters.MethodFilter()

    class Meta:
        model = Category
        fields = ("id_in", "name",)
        order_by = ['id', '-id', 'name', '-name', 'slug', '-slug']

    def filter_id_in(self, queryset, value):
        return queryset.filter(id__in=get_id_list(value))

    def filter_name(self, queryset, value):
        return queryset.filter(name__icontains=value)


class TagConnection(Connection):
    def resolve_total_count(self, args, info):
        return Tag.objects.all().count()


class TagNode(DjangoNode):
    connection_type = Connection
    original_id = graphene.Int()
    counter_entries = graphene.Int()

    class Meta:
        model = Tag

    def resolve_original_id(self, args, info):
        return self.id

    def resolve_counter_entries(self, args, info):
        return self.counter_entries()

    connection_type = TagConnection


class StatusEnum(graphene.Enum):
    Draft = "0"
    Online = "1"


class EntryConnection(Connection):
    def resolve_total_count(self, args, info):
        return Entry.objects.all().count()


class EntryFilter(django_filters.FilterSet):
    search = django_filters.MethodFilter()

    class Meta:
        model = Entry
        fields = {
            'title': ['icontains'],
            'date': ['gt'],
            'sticky': ['exact'],
            'status': ['exact'],
            'section': ['exact'],
            'category': ['exact'],
            'tags': ['exact'],
            'owner': ['exact'],
            'summary': ['icontains'],
        }
        order_by = ['id', '-id', 'title', '-title', 'status', '-status', 'date', '-date', 'section', '-section', 'category', '-category']

    def filter_search(self, queryset, value):
        search_fields = ("title", "section__name", "category__name",)
        search_terms = value.replace(',', ' ').split()
        if not search_fields or not search_terms:
            return queryset
        orm_lookups = [
            self.construct_search(six.text_type(search_field))
            for search_field in search_fields
        ]
        base = queryset
        for search_term in search_terms:
            queries = [
                models.Q(**{orm_lookup: search_term})
                for orm_lookup in orm_lookups
            ]
            queryset = queryset.filter(reduce(operator.or_, queries))
        return distinct(queryset, base)

    def construct_search(self, field_name):
        return "%s__icontains" % field_name


class EntryNode(DjangoNode):
    connection_type = Connection
    original_id = graphene.Int()
    status = graphene.Field(StatusEnum)
    tags = graphene.List(TagNode)
    # sticky = graphene.Boolean()
    counter_links = graphene.Int()
    counter_tags = graphene.Int()

    class Meta:
        model = Entry
        # error with image (therefore we currently use only_fields)
        only_fields = ('id', 'title', 'status', 'date', 'sticky', 'section', 'category', 'tags', 'summary', 'body', 'owner', 'locked', 'createdate', 'updatedate', 'counter_links', 'counter_tags',)

    def resolve_original_id(self, args, info):
        return self.id

    def resolve_tags(self, args, info):
        return self.tags.all()

    def resolve_counter_links(self, args, info):
        return self.counter_links()

    def resolve_counter_tags(self, args, info):
        return self.counter_tags()

    connection_type = EntryConnection


class EntrylinkNode(DjangoNode):
    connection_type = Connection
    original_id = graphene.Int()

    class Meta:
        model = EntryLink
        filter_fields = {
            'entry': ['exact']
        }
        filter_order_by = ['id', 'entry', 'title', 'position']

    def resolve_original_id(self, args, info):
        return self.id


def get_user(relayId, otherwise=None):
    try:
        return User.objects.get(pk=from_global_id(relayId)[1])
    except:
        return otherwise


def get_section(relayId, otherwise=None):
    try:
        return Section.objects.get(pk=from_global_id(relayId)[1])
    except:
        return otherwise


def get_category(relayId, otherwise=None):
    try:
        return Category.objects.get(pk=from_global_id(relayId)[1])
    except:
        return otherwise


def get_tag(relayId, otherwise=None):
    try:
        return Tag.objects.get(pk=from_global_id(relayId)[1])
    except:
        return otherwise


def get_entry(relayId, otherwise=None):
    try:
        return Entry.objects.get(pk=from_global_id(relayId)[1])
    except:
        return otherwise


def get_entrylink(relayId, otherwise=None):
    try:
        return EntryLink.objects.get(pk=from_global_id(relayId)[1])
    except:
        return otherwise


def get_user_id(relayId, otherwise=None):
    try:
        return from_global_id(relayId)[1]
    except:
        return otherwise


def get_section_id(relayId, otherwise=None):
    try:
        return from_global_id(relayId)[1]
    except:
        return otherwise


def get_category_id(relayId, otherwise=None):
    try:
        return from_global_id(relayId)[1]
    except:
        return otherwise


def get_tags_ids(relayIdList, otherwise=None):
    tags = []
    if relayIdList:
        for relayId in relayIdList:
            try:
                tags.append(from_global_id(relayId)[1])
            except:
                pass
    return tags


def get_entry_id(relayId, otherwise=None):
    try:
        return from_global_id(relayId)[1]
    except:
        return otherwise


class CreateUser(relay.ClientIDMutation):

    class Input:
        username = String(required=False)
        first_name = String(required=False)
        last_name = String(required=False)
        email = String(required=False)
        is_staff = Boolean(required=False)
        is_active = Boolean(required=False)
        password = String(required=False)

    user = Field(UserNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            user = User()
            user.username = input.get('username')
            user.first_name = input.get('first_name', '')
            user.last_name = input.get('last_name', '')
            user.email = input.get('email', '')
            user.is_staff = input.get('is_staff', False)
            user.is_active = input.get('is_active', False)
            if input.get('password'):
                user.set_password(input.get('password'))
            user.full_clean()
            user.save()
            return CreateUser(user=user)
        except ValidationError as e:
            return CreateUser(user=None, errors=getErrors(e))


class ChangeUser(relay.ClientIDMutation):

    class Input:
        id = String(required=True)
        username = String(required=False)
        first_name = String(required=False)
        last_name = String(required=False)
        email = String(required=False)
        is_staff = Boolean(required=False)
        is_active = Boolean(required=False)
        password = String(required=False)

    user = Field(UserNode)
    errors = String().List

    @classmethod
    @graphene.with_context
    def mutate_and_get_payload(cls, input, context, info):
        try:
            auth = get_authorization_header(context).split()
        except:
            auth = None
        user = get_user(input.get('id'))
        user.username = input.get('username')
        user.first_name = input.get('first_name')
        user.last_name = input.get('last_name')
        user.email = input.get('email')
        user.is_staff = input.get('is_staff')
        user.is_active = input.get('is_active')
        # only allow user to set her own password
        password = input.get('password', None)
        if auth is not None and password is not None and user.token == auth[1]:
            user.set_password(password)
        try:
            user.full_clean()
            user.save()
            return ChangeUser(user=user)
        except ValidationError as e:
            return ChangeUser(user=user, errors=getErrors(e))


class CreateSection(relay.ClientIDMutation):

    class Input:
        name = String(required=False)
        slug = String(required=False)
        position = Int(required=False)

    section = Field(SectionNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            section = Section()
            section.name = input.get('name')
            section.slug = input.get('slug')
            section.position = input.get('position')
            section.full_clean()
            section.save()
            return CreateSection(section=section)
        except ValidationError as e:
            return CreateSection(section=None, errors=getErrors(e))


class ChangeSection(relay.ClientIDMutation):

    class Input:
        id = String(required=True)
        name = String(required=False)
        slug = String(required=False)
        position = Int(required=False)

    section = Field(SectionNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        section = get_section(input.get('id'))
        section.name = input.get('name')
        section.slug = input.get('slug')
        section.position = input.get('position')
        try:
            section.full_clean()
            section.save()
            return ChangeSection(section=section)
        except ValidationError as e:
            return ChangeSection(section=section, errors=getErrors(e))


class DeleteSection(relay.ClientIDMutation):

    class Input:
        id = String(required=True)

    deleted = Boolean()
    section = Field(SectionNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            section = get_section(input.get('id'))
            section.delete()
            return DeleteSection(deleted=True, section=section)
        except:
            return DeleteSection(deleted=False, section=None)


class CreateCategory(relay.ClientIDMutation):

    class Input:
        section = ID(required=False)
        name = String(required=False)
        slug = String(required=False)
        position = Int(required=False)

    category = Field(CategoryNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            category = Category()
            category.section_id = get_section_id(input.get('section'))
            category.name = input.get('name')
            category.slug = input.get('slug')
            category.position = input.get('position')
            category.full_clean()
            category.save()
            return CreateCategory(category=category)
        except ValidationError as e:
            return CreateCategory(category=None, errors=getErrors(e))


class ChangeCategory(relay.ClientIDMutation):

    class Input:
        id = String(required=True)
        section = ID(required=False)
        name = String(required=False)
        slug = String(required=False)
        position = Int(required=False)

    category = Field(CategoryNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        category = get_category(input.get('id'))
        category.section_id = get_section_id(input.get('section'))
        category.name = input.get('name')
        category.slug = input.get('slug')
        category.position = input.get('position')
        try:
            category.full_clean()
            category.save()
            return ChangeCategory(category=category)
        except ValidationError as e:
            return ChangeCategory(category=category, errors=getErrors(e))


class DeleteCategory(relay.ClientIDMutation):

    class Input:
        id = String(required=True)

    deleted = Boolean()
    category = Field(CategoryNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            category = get_category(input.get('id'))
            category.delete()
            return DeleteCategory(deleted=True, category=category)
        except:
            return DeleteCategory(deleted=False, category=None)


class CreateTag(relay.ClientIDMutation):

    class Input:
        name = String(required=False)
        slug = String(required=False)

    tag = Field(TagNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            tag = Tag()
            tag.name = input.get('name')
            tag.full_clean()
            tag.save()
            return CreateTag(tag=tag)
        except ValidationError as e:
            return CreateTag(tag=None, errors=getErrors(e))


class ChangeTag(relay.ClientIDMutation):

    class Input:
        id = String(required=True)
        name = String(required=False)
        slug = String(required=False)

    tag = Field(TagNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        tag = get_tag(input.get('id'))
        tag.name = input.get('name')
        try:
            tag.full_clean()
            tag.save()
            return ChangeTag(tag=tag)
        except ValidationError as e:
            return ChangeTag(tag=tag, errors=getErrors(e))


class DeleteTag(relay.ClientIDMutation):

    class Input:
        id = String(required=True)

    deleted = Boolean()
    tag = Field(TagNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            tag = get_tag(input.get('id'))
            tag.delete()
            return DeleteTag(deleted=True, tag=tag)
        except:
            return DeleteTag(deleted=False, tag=None)


class CreateEntry(relay.ClientIDMutation):

    class Input:
        title = String(required=False)
        status = StatusEnum(required=False)
        date = String(required=False)
        sticky = Boolean(required=False)
        section = ID(required=False)
        category = ID(required=False)
        tags = List(ID())
        summary = String(required=False)
        body = String(required=False)
        owner = ID(required=False)

    entry = Field(EntryNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            entry = Entry()
            entry.title = input.get('title')
            entry.status = input.get('status')
            entry.date = input.get('date')
            entry.sticky = input.get('sticky', False)
            entry.section_id = get_section_id(input.get('section'))
            entry.category_id = get_category_id(input.get('category'))
            entry.summary = input.get('summary', '')
            entry.body = input.get('body', '')
            entry.owner_id = get_user_id(input.get('owner'), otherwise=input.get('owner'))
            entry.full_clean()
            entry.save()
            entry.tags = get_tags_ids(input.get('tags'))
            return CreateEntry(entry=entry)
        except ValidationError as e:
            return CreateEntry(entry=None, errors=getErrors(e))
        except Exception as e:
            print '%s (%s)' % (e.message, type(e))


class ChangeEntry(relay.ClientIDMutation):

    class Input:
        id = String(required=True)
        title = String(required=False)
        status = StatusEnum(required=False)
        date = String(required=False)
        sticky = Boolean(required=False)
        section = ID(required=False)
        category = ID(required=False)
        tags = List(ID())
        summary = String(required=False)
        body = String(required=False)

    entry = Field(EntryNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        entry = get_entry(input.get('id'))
        entry.title = input.get('title')
        entry.status = input.get('status')
        entry.date = input.get('date')
        entry.sticky = input.get('sticky')
        entry.section_id = get_section_id(input.get('section'))
        entry.category_id = get_category_id(input.get('category'))
        entry.summary = input.get('summary', '')
        entry.body = input.get('body', '')
        entry.tags = get_tags_ids(input.get('tags'))
        try:
            entry.full_clean()
            entry.save()
            return ChangeEntry(entry=entry)
        except ValidationError as e:
            return ChangeEntry(entry=entry, errors=getErrors(e))
        except Exception as e:
            print '%s (%s)' % (e.message, type(e))


class DeleteEntry(relay.ClientIDMutation):

    class Input:
        id = String(required=True)

    deleted = Boolean()
    entry = Field(EntryNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            entry = get_entry(input.get('id'))
            entry.delete()
            return DeleteEntry(deleted=True, entry=entry)
        except:
            return DeleteEntry(deleted=False, entry=None)


class CreateEntrylink(relay.ClientIDMutation):

    class Input:
        entry = ID(required=False)
        url = String(required=False)
        title = String(required=False)
        description = String(required=False)
        position = Int(required=False)

    entrylink = Field(EntrylinkNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            entrylink = EntryLink()
            entrylink.entry_id = get_entry_id(input.get('entry'))
            entrylink.url = input.get('url', '')
            entrylink.title = input.get('title', '')
            entrylink.full_clean()
            entrylink.save()
            return CreateEntrylink(entrylink=entrylink)
        except ValidationError as e:
            return CreateEntrylink(entrylink=None, errors=getErrors(e))
        except Exception as e:
            print '%s (%s)' % (e.message, type(e))


class ChangeEntrylink(relay.ClientIDMutation):

    class Input:
        id = String(required=True)
        entry = ID(required=False)
        url = String(required=False)
        title = String(required=False)
        description = String(required=False)
        position = Int(required=False)

    entrylink = Field(EntrylinkNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        entrylink = get_entrylink(input.get('id'))
        entrylink.entry_id = get_entry_id(input.get('entry'))
        entrylink.url = input.get('url', '')
        entrylink.title = input.get('title', '')
        try:
            entrylink.full_clean()
            entrylink.save()
            return ChangeEntrylink(entrylink=entrylink)
        except ValidationError as e:
            return ChangeEntrylink(entrylink=entrylink, errors=getErrors(e))


class DeleteEntrylink(relay.ClientIDMutation):

    class Input:
        id = String(required=True)

    deleted = Boolean()
    entrylink = Field(EntrylinkNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            entrylink = get_entrylink(input.get('id'))
            entrylink.delete()
            return DeleteEntrylink(deleted=True, entrylink=entrylink)
        except:
            return DeleteEntrylink(deleted=False, entrylink=None)


class Query(ObjectType):
    # user
    user = relay.NodeField(UserNode)
    all_users = DjangoFilterConnectionField(UserNode, s=graphene.String())
    # category
    section = relay.NodeField(SectionNode)
    all_sections = DjangoFilterConnectionField(SectionNode, filterset_class=SectionFilter, s=graphene.String())
    # category
    category = relay.NodeField(CategoryNode)
    all_categories = DjangoFilterConnectionField(CategoryNode, filterset_class=CategoryFilter, s=graphene.String())
    # tag
    tag = relay.NodeField(TagNode)
    all_tags = DjangoFilterConnectionField(TagNode, filterset_class=TagFilter, s=graphene.String())
    # entry
    entry = relay.NodeField(EntryNode)
    all_entries = DjangoFilterConnectionField(EntryNode, filterset_class=EntryFilter, s=graphene.String())
    # entrylink
    entrylink = relay.NodeField(EntrylinkNode)
    all_entrylinks = DjangoFilterConnectionField(EntrylinkNode, s=graphene.String())

    class Meta:
        abstract = True


class Mutation(ObjectType):
    # user
    create_user = Field(CreateUser)
    change_user = Field(ChangeUser)
    # section
    create_section = Field(CreateSection)
    change_section = Field(ChangeSection)
    delete_section = Field(DeleteSection)
    # category
    create_category = Field(CreateCategory)
    change_category = Field(ChangeCategory)
    delete_category = Field(DeleteCategory)
    # tag
    create_tag = Field(CreateTag)
    change_tag = Field(ChangeTag)
    delete_tag = Field(DeleteTag)
    # entry
    create_entry = Field(CreateEntry)
    change_entry = Field(ChangeEntry)
    delete_entry = Field(DeleteEntry)
    # entrylink
    create_entrylink = Field(CreateEntrylink)
    change_entrylink = Field(ChangeEntrylink)
    delete_entrylink = Field(DeleteEntrylink)
