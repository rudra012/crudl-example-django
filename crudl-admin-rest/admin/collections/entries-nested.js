import { types } from '../../Definitions'

var actions = {
    list: (req, connexes) => connexes.entries_nested.read(req),
    get: (req, connexes) => connexes.entry_nested.read(req),
    delete: (req, connexes) => connexes.entry_nested.delete(req),
    save: (req, connexes) => connexes.entry_nested.update(req),
    add: (req, connexes) => connexes.entries_nested.create(req),
}

//-------------------------------------------------------------------
var collection = {
    meta: {
        type: types.TYPE_COLLECTION,
        path: 'entries-nested',
        actions,
    },
    title: 'Nested Blog Entries',
    fields: [ 'title', 'date', 'category.name', 'user.username', 'tags[*].name' ],
}

//-------------------------------------------------------------------
collection.resource =  {
    meta: {
        type: types.TYPE_RESOURCE,
        path: 'entries-nested/:id',
        actions,
    },
    title: 'Nested Blog Entry',
}

//-------------------------------------------------------------------
collection.resource.add = {
    meta: {
        type: types.TYPE_ADD_RESOURCE,
        actions,
    },
    path: 'nested-entries/new',
}

//-------------------------------------------------------------------
collection.resource.fields = [
    {
        meta: { type: types.TYPE_FIELD },
        name: 'title',
        label: 'Title',
        field: 'String',
    },
    {
        meta: {
            type: types.TYPE_FIELD,
            actions: {
                asyncProps: (req, connexes) => connexes.entry_categories.read(req),
            }
        },
        name: 'category',
        key: 'category.id',
        label: 'Category',
        field: 'Select',
    },
    {
        meta: { type: types.TYPE_FIELD },
        name: 'date',
        label: 'Date',
        field: 'Date',
    },
    {
        meta: { type: types.TYPE_FIELD },
        name: 'body',
        label: 'Text',
        field: 'Text',
    },
    {
        meta: {
            type: types.TYPE_FIELD,
            actions: {
                asyncProps: (req, connexes) => connexes.tags_options.read(req)
            },
        },
        name: 'tags',
        key: 'tags[*].id',
        label: 'Tags',
        field: 'Select',
    },
]

export default { collections: [collection] }
