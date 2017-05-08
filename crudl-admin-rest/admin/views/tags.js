import React from 'react'
import { slugify } from '../utils'

//-------------------------------------------------------------------
var listView = {
    path: 'tags',
    title: 'Tags',
    actions: {
        list: function (req) { return crudl.connectors.tags.read(req) }
    },
    bulkActions: {
        delete: {
            description: 'Delete selected',
            modalConfirm: {
                message: "All the selected items will be deleted. This action cannot be reversed!",
                modalType: 'modal-delete',
                labelConfirm: "Delete All",
            },
            action: (selection) => {
                return Promise.all(selection.map(
                    item => crudl.connectors.tag(item.id).delete(crudl.req()))
                )
                .then(() => crudl.successMessage(`All items (${selection.length}) were deleted`))
            },
        },
    }
}

listView.fields = [
    {
        name: 'id',
        label: 'ID',
    },
    {
        name: 'name',
        label: 'Name',
        main: true,
        sortable: true,
        sorted: 'ascending',
        sortpriority: '1',
        sortKey: 'slug',
    },
    {
        name: 'slug',
        label: 'Slug',
        sortable: true,
    },
    {
        name: 'counter_entries',
        label: 'No. Entries',
    },
]

listView.filters = {
    fields: [
        {
            name: 'name',
            label: 'Search',
            field: 'Search',
            helpText: 'Name'
        }
    ]
}


//-------------------------------------------------------------------
var changeView = {
    path: 'tags/:id',
    title: 'Tag',
    actions: {
        get: function (req) { return crudl.connectors.tag(crudl.path.id).read(req) },
        delete: function (req) { return crudl.connectors.tag(crudl.path.id).delete(req) },
        save: function (req) { return crudl.connectors.tag(crudl.path.id).update(req) },
    },
}

changeView.fields = [
    {
        name: 'name',
        label: 'Name',
        field: 'String',
    },
    {
        name: 'slug',
        label: 'Slug',
        field: 'String',
        readOnly: true,
        onChange: {
            in: 'name',
            setInitialValue: (name) => slugify(name.value),
        },
        helpText: `Slug is automatically generated when saving the Tag.`,
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'tags/new',
    title: 'New Tag',
    fields: changeView.fields,
    actions: {
        add: function (req) { return crudl.connectors.tags.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
