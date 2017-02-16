import { slugify } from '../utils'
import React from 'react'

//-------------------------------------------------------------------
var listView = {
    path: 'sections',
    title: 'Sections',
    actions: {
        list: function (req) { return crudl.connectors.sections.read(req) }
    }
}

listView.fields = [
    {
        name: 'originalId',
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
    },
    {
        name: 'counterEntries',
        label: 'No. Entries',
    },
]

//-------------------------------------------------------------------
var changeView = {
    path: 'sections/:id',
    title: 'Section',
    actions: {
        get: function (req) { return crudl.connectors.section(crudl.path.id).read(req) },
        delete: function (req) { return crudl.connectors.section(crudl.path.id).delete(req) },
        save: function (req) { return crudl.connectors.section(crudl.path.id).update(req) },
    },
}

changeView.fields = [
    {
        name: 'id',
        hidden: true,
    },
    {
        name: 'name',
        label: 'Name',
        field: 'String',
        required: true
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
    }
]

//-------------------------------------------------------------------
var addView = {
    path: 'sections/new',
    title: 'New Section',
    fields: changeView.fields,
    actions: {
        add: function (req) { return crudl.connectors.sections.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
