import { join, slugify } from '../utils'
import React from 'react'

//-------------------------------------------------------------------
var listView = {
    path: 'categories',
    title: 'Categories',
    actions: {
        list: function (req) { return crudl.connectors.categories.read(req) }
    }
}

listView.fields = [
    {
        name: 'originalId',
        label: 'ID',
    },
    {
        name: 'section',
        key: 'section.name',  // see actions for listView
        label: 'Section',
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
    },
    {
        name: 'counterEntries',
        label: 'No. Entries',
    },
]

listView.filters = {
    fields: [
        {
            name: 'section',
            label: 'Section',
            field: 'Select',
            props: () => crudl.connectors.sections_options.read(crudl.req()).then(res => res.data),
            initialValue: '',
        },
        {
            name: 'name',
            label: 'Name Contains',
            field: 'String',
        },
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'categories/:id',
    title: 'Category',
    actions: {
        get: function (req) { return crudl.connectors.category(crudl.path.id).read(req) },
        delete: function (req) { return crudl.connectors.category(crudl.path.id).delete(req) },
        save: function (req) { return crudl.connectors.category(crudl.path.id).update(req) },
    },
}

changeView.fields = [
    {
        name: 'id',
        field: 'hidden',
    },
    {
        name: 'section',
        key: 'section.id',
        label: 'Section',
        field: 'Select',
        required: true,
        props: () => crudl.connectors.sections_options.read(crudl.req()).then(res => res.data)
    },
    {
        name: 'name',
        label: 'Name',
        field: 'String',
        required: true,
    },
    {
        name: 'slug',
        label: 'Slug',
        field: 'String',
        onChange: {
            in: 'name',
            setInitialValue: (name) => slugify(name.value),
        },
        props: {
            helpText: <span>If left blank, the slug will be automatically generated.
            More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.</span>,
        }
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'categories/new',
    title: 'New Category',
    fields: changeView.fields,
    actions: {
        add: function (req) { return crudl.connectors.categories.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
