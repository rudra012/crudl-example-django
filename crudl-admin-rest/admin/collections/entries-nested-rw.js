import { types } from '../../Definitions'

var actions = {
    list: (req, connexes) => connexes.entries_nested_rw.read(req),
    get: (req, connexes) => connexes.entry_nested_rw.read(req),
    delete: (req, connexes) => connexes.entry_nested_rw.delete(req),
    save: (req, connexes) => connexes.entry_nested_rw.update(req),
    add: (req, connexes) => connexes.entries_nested_rw.create(req),
}

//-------------------------------------------------------------------
var collection = {
    meta: {
        type: types.TYPE_COLLECTION,
        path: 'entries-nested-rw',
        actions,
    },
    title: 'Read-Write Nested',
    fields: [ 'title', 'date', 'category.name', 'user.username', 'tags[*].name' ],
}

//-------------------------------------------------------------------
collection.resource =  {
    meta: {
        type: types.TYPE_RESOURCE,
        path: 'entries-nested-rw/:id',
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
        meta: { type: types.TYPE_DEEP_FORM, },
        name: 'category',
        label: 'Category',
        fields: [
            {
                meta: {
                    type: types.TYPE_FIELD,
                    actions: {
                        asyncProps: (req, connexes) => connexes.entry_categories.read(req),
                    }
                },
                name: 'id',
                label: 'Name',
                field: 'Select',
            },
        ]
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
    // {
    //     meta: {
    //         type: types.TYPE_DEEP_FORM,
    //     },
    //     name: 'tags',
    //     label: 'Tags',
    //     fields: [
    //         {
    //             meta: {
    //                 type: types.TYPE_FIELD,
    //                 actions: {
    //                     asyncProps: (req, connexes) => connexes.tags_options.read(req)
    //                 },
    //             },
    //             name: 'id',
    //             label: 'Tags',
    //             field: 'Select',
    //         },
    //     ]
    // },
]

export default { collections: [collection] }
