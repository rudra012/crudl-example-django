import { join, slugify } from '../utils'
import React from 'react'

//-------------------------------------------------------------------
var listView = {
    path: 'categories',
    title: 'Categories',
    actions: {
        /* The list of categories contains a section ID, but we need
        the section object in order to show the section.name with the listView.
        Instead, we could also add the section object (or name) to the list of
        categories within the API. In that case, no join is required (see entries.js
        for the alternative solution) */
        list: function (req) {
            let categories = crudl.connectors.categories.read(req)
            let sections = crudl.connectors.sections.read(crudl.req())
            return join(categories, sections, 'section', 'id')
        },
    }
}

listView.fields = [
    {
        name: 'id',
        label: 'ID',
    },
    {
        name: 'section',
        key: 'section.name',  // see actions for listView
        label: 'Section',
        sortable: true,
        sorted: 'ascending',
        sortpriority: '1',
    },
    {
        name: 'name',
        label: 'Name',
        main: true,
        sortable: true,
        sorted: 'ascending',
        sortpriority: '2',
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
            name: 'search',
            label: 'Search',
            field: 'Search',
            props: {
                helpText: 'Section, Name'
            }
        },
        {
            name: 'section',
            label: 'Section',
            field: 'Select',
            /* we manually build the available options. please note that you could also
            use a connector, making this a one-liner */
            props: () => crudl.connectors.sections.read(crudl.req()).then(res => ({
                options: res.data.map(section => ({
                    value: section.id,
                    label: section.name,
                }))
            })),
            initialValue: '',
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
        name: 'section',
        label: 'Section',
        field: 'Select',
        required: true,
        /* Here we build the list of possible options with an extra API call */
        props: () => crudl.connectors.sections.read(crudl.req()).then(res => ({
            options: res.data.map(section => ({
                value: section.id,
                label: section.name,
            }))
        })),
        add: 'sections/new',
        edit: () => `sections/${crudl.context('section')}`,
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
