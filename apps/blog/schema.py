# coding: utf-8

# GENERAL DJANGO IMPORTS
from django.core.exceptions import ValidationError

# GRAPHENE IMPORTS
import graphene
from graphene import relay, ObjectType, Field, String, Int, ID, Boolean, List
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.contrib.django.types import DjangoNode, DjangoConnection
from graphql_relay.node.node import from_global_id

# PROJECT IMPORTS
from apps.blog.models import User, Section, Category, Tag, Entry, EntryLink


class Connection(DjangoConnection):
    total_count = graphene.Int()

    def resolve_total_count(self, args, info):
        return len(self.get_connection_data())


class UserNode(DjangoNode):
    original_id = graphene.Int()

    class Meta:
        model = User
        filter_fields = {
            'username': ['icontains'],
            'is_staff': ['exact'],
            'is_active': ['exact']
        }
        filter_order_by = ['id', 'username', 'is_staff', 'is_active', 'date_joined']

    def resolve_original_id(self, args, info):
        return self.id


class SectionNode(DjangoNode):
    connection_type = Connection
    original_id = graphene.Int()

    class Meta:
        model = Section
        filter_fields = {
            'name': ['icontains'],
        }
        filter_order_by = ['id', 'name', 'slug', 'position']

    def resolve_original_id(self, args, info):
        return self.id


class CategoryNode(DjangoNode):
    connection_type = Connection
    original_id = graphene.Int()

    class Meta:
        model = Category
        filter_fields = {
            'section': ['exact'],
            'name': ['icontains'],
        }
        filter_order_by = ['id', 'section', 'name', 'slug', 'position']

    def resolve_original_id(self, args, info):
        return self.id


class TagNode(DjangoNode):
    connection_type = Connection
    original_id = graphene.Int()

    class Meta:
        model = Tag
        filter_fields = {
            'name': ['icontains'],
        }
        filter_order_by = ['id', 'name', 'slug']

    def resolve_original_id(self, args, info):
        return self.id


class EntryNode(DjangoNode):
    connection_type = Connection
    original_id = graphene.Int()

    class Meta:
        model = Entry
        # error with image (therefore we currently use only_fields)
        only_fields = ('id', 'title', 'status', 'date', 'sticky', 'section', 'category', 'tags', 'summary', 'body', 'owner', 'locked', 'createdate', 'updatedate',)
        filter_fields = {
            'title': ['icontains'],
            'date': ['exact'],
            'status': ['exact'],
            'section': ['exact'],
            'category': ['exact'],
            'tags': ['exact'],
            'owner': ['exact'],
        }
        filter_order_by = ['id', 'title', 'date', 'section', 'category', 'tags']

    def resolve_original_id(self, args, info):
        return self.id


class EntryLinkNode(DjangoNode):
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
        return User.objects.get(pk=from_global_id(relayId).id)
    except:
        return otherwise


def get_section(relayId, otherwise=None):
    try:
        return Section.objects.get(pk=from_global_id(relayId).id)
    except:
        return otherwise


def get_category(relayId, otherwise=None):
    try:
        return Category.objects.get(pk=from_global_id(relayId).id)
    except:
        return otherwise


def get_tag(relayId, otherwise=None):
    try:
        return Tag.objects.get(pk=from_global_id(relayId).id)
    except:
        return otherwise


def get_entry(relayId, otherwise=None):
    try:
        return Entry.objects.get(pk=from_global_id(relayId).id)
    except:
        return otherwise


def get_entrylink(relayId, otherwise=None):
    try:
        return EntryLink.objects.get(pk=from_global_id(relayId).id)
    except:
        return otherwise


def get_user_id(relayId, otherwise=None):
    try:
        return from_global_id(relayId).id
    except:
        return otherwise


def get_section_id(relayId, otherwise=None):
    try:
        return from_global_id(relayId).id
    except:
        return otherwise


def get_category_id(relayId, otherwise=None):
    try:
        return from_global_id(relayId).id
    except:
        return otherwise


def get_tags_ids(relayIdList, otherwise=None):
    tags = []
    if relayIdList:
        for relayId in relayIdList:
            try:
                tags.append(from_global_id(relayId).id)
            except:
                pass
    return tags


def get_entry_id(relayId, otherwise=None):
    try:
        return from_global_id(relayId).id
    except:
        return otherwise


class CreateSection(relay.ClientIDMutation):

    class Input:
        name = String(required=True)
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
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return CreateSection(section=None, errors=errors)


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
        if input.get('name'):
            section.name = input.get('name')
        if input.get('slug'):
            section.slug = input.get('slug')
        if input.get('position'):
            section.position = input.get('position')
        try:
            section.full_clean()
            section.save()
            return ChangeSection(section=section)
        except ValidationError as e:
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return ChangeSection(section=section, errors=errors)


class DeleteSection(relay.ClientIDMutation):

    class Input:
        id = String(required=True)

    deleted = Boolean()
    category = Field(CategoryNode)

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
        section = ID(required=True)
        name = String(required=True)
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
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return CreateCategory(category=None, errors=errors)


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
        if input.get('section'):
            category.section_id = get_section_id(input.get('section'))
        if input.get('name'):
            category.name = input.get('name')
        if input.get('slug'):
            category.slug = input.get('slug')
        if input.get('position'):
            category.position = input.get('position')
        try:
            category.full_clean()
            category.save()
            return ChangeCategory(category=category)
        except ValidationError as e:
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return ChangeCategory(category=category, errors=errors)


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
        name = String(required=True)

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
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return CreateTag(tag=None, errors=errors)


class ChangeTag(relay.ClientIDMutation):

    class Input:
        id = String(required=True)
        name = String(required=False)

    tag = Field(TagNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        tag = get_tag(input.get('id'))
        if input.get('name'):
            tag.name = input.get('name')
        try:
            tag.full_clean()
            tag.save()
            return ChangeTag(tag=tag)
        except ValidationError as e:
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return ChangeTag(tag=tag, errors=errors)


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
        title = String(required=True)
        date = String(required=True)
        date_from = String(required=False)
        date_until = String(required=False)
        sticky = Boolean(required=False)
        status = String(required=False)
        section = ID(required=True)
        category = ID(required=False)
        tags = List(ID())
        body = String(required=False)

    entry = Field(EntryNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            entry = Entry()
            entry.title = input.get('title')
            entry.date = input.get('date')
            entry.date_from = input.get('date_from')
            entry.date_until = input.get('date_until')
            entry.sticky = input.get('sticky')
            entry.status = input.get('status')
            entry.section_id = get_section_id(input.get('section'))
            entry.category_id = get_category_id(input.get('category'))
            entry.body = input.get('body')
            entry.full_clean()
            entry.save()
            entry.tags = get_tags_ids(input.get('tags'))
            return CreateEntry(entry=entry)
        except ValidationError as e:
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return CreateEntry(entry=None, errors=errors)


class ChangeEntry(relay.ClientIDMutation):

    class Input:
        id = String(required=True)
        title = String(required=False)
        date = String(required=False)
        date_from = String(required=False)
        date_until = String(required=False)
        sticky = Boolean(required=False)
        status = String(required=False)
        section = ID(required=False)
        category = ID(required=False)
        tags = List(ID())
        body = String(required=False)

    entry = Field(EntryNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        entry = get_entry(input.get('id'))
        if input.get('title'):
            entry.title = input.get('title')
        if input.get('date'):
            entry.date = input.get('date')
        if input.get('date_from'):
            entry.date_from = input.get('date_from')
        if input.get('date_until'):
            entry.date_until = input.get('date_until')
        if input.get('sticky'):
            entry.sticky = input.get('sticky')
        if input.get('status'):
            entry.status = input.get('status')
        if input.get('section'):
            entry.section_id = get_section_id(input.get('section'))
        if input.get('category'):
            entry.category_id = get_category_id(input.get('category'))
        if input.get('body'):
            entry.body = input.get('body')
        if input.get('tags'):
            entry.tags = get_tags_ids(input.get('tags'))
        try:
            entry.full_clean()
            entry.save()
            return ChangeEntry(entry=entry)
        except ValidationError as e:
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return ChangeEntry(entry=entry, errors=errors)


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


class CreateEntryLink(relay.ClientIDMutation):

    class Input:
        entry = ID(required=True)
        url = String(required=True)
        title = String(required=True)
        description = String(required=False)
        position = Int(required=False)

    entrylink = Field(EntryLinkNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            entrylink = EntryLink()
            entrylink.entry_id = get_entry_id(input.get('entry'))
            entrylink.url = input.get('url')
            entrylink.title = input.get('title')
            entrylink.description = input.get('description', '')
            entrylink.position = input.get('position')
            entrylink.full_clean()
            entrylink.save()
            return CreateEntryLink(entrylink=entrylink)
        except ValidationError as e:
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return CreateEntryLink(entrylink=None, errors=errors)


class ChangeEntryLink(relay.ClientIDMutation):

    class Input:
        id = String(required=True)
        entry = ID(required=False)
        url = String(required=False)
        title = String(required=False)
        description = String(required=False)
        position = Int(required=False)

    entrylink = Field(EntryLinkNode)
    errors = String().List

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        entrylink = get_entrylink(input.get('id'))
        if input.get('entry'):
            entrylink.entry_id = get_entry_id(input.get('entry'))
        if input.get('url'):
            entrylink.url = input.get('url')
        if input.get('title'):
            entrylink.title = input.get('title')
        if input.get('description'):
            entrylink.description = input.get('description')
        if input.get('position'):
            entrylink.position = input.get('position')
        try:
            entrylink.full_clean()
            entrylink.save()
            return ChangeEntryLink(entrylink=entrylink)
        except ValidationError as e:
            fields = e.message_dict.keys()
            messages = ['; '.join(m) for m in e.message_dict.values()]
            errors = [i for pair in zip(fields, messages) for i in pair]
            return ChangeEntryLink(entrylink=entrylink, errors=errors)


class DeleteEntryLink(relay.ClientIDMutation):

    class Input:
        id = String(required=True)

    deleted = Boolean()
    entrylink = Field(EntryLinkNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        try:
            entrylink = get_entrylink(input.get('id'))
            entrylink.delete()
            return DeleteEntryLink(deleted=True, entrylink=entrylink)
        except:
            return DeleteEntryLink(deleted=False, entrylink=None)


class Query(ObjectType):
    # user
    user = relay.NodeField(UserNode)
    all_users = DjangoFilterConnectionField(UserNode)
    # category
    section = relay.NodeField(SectionNode)
    all_sections = DjangoFilterConnectionField(SectionNode)
    # category
    category = relay.NodeField(CategoryNode)
    all_categories = DjangoFilterConnectionField(CategoryNode)
    # tag
    tag = relay.NodeField(TagNode)
    all_tags = DjangoFilterConnectionField(TagNode)
    # entry
    entry = relay.NodeField(EntryNode)
    all_entries = DjangoFilterConnectionField(EntryNode)
    # entrylink
    link = relay.NodeField(EntryLinkNode)
    all_links = DjangoFilterConnectionField(EntryLinkNode)

    class Meta:
        abstract = True


class Mutation(ObjectType):
    # user
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
    create_entrylink = Field(CreateEntryLink)
    change_entrylink = Field(ChangeEntryLink)
    delete_entrylink = Field(DeleteEntryLink)
