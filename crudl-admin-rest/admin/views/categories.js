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
    },
    bulkActions: {
        delete: {
            description: 'Delete selected',
            modalConfirm: {
                message: "All the selected items will be deleted. This action cannot be reversed!",
                modalType: 'modal-delete',
                labelConfirm: "Delete All",
            },
            action: selection => Promise.all(selection.map(
                item => crudl.connectors.category(item.id).delete(crudl.req())
            ))
        },
        changeSection: {
            description: 'Change Section',
            before: (selection) => ({ onProceed, onCancel }) => (
                <div>
                    {crudl.createForm({
                        id: 'select-section',
                        title: 'Select Section',
                        fields: [{
                            name: 'section',
                            label: 'Section',
                            field: 'Select',
                            lazy: () => crudl.connectors.sectionsOptions.read(crudl.req()).then(res => res.data),
                        }],
                        onSubmit: values => onProceed(
                            selection.map(s => Object.assign({}, s, { section: values.section }))
                        ),
                        onCancel,
                    })}
                </div>
            ),
            action: (selection) => {
                return Promise.all(selection.map(
                    item => crudl.connectors.category(item.id).update(crudl.req(item)))
                ).then(() => crudl.successMessage('Successfully changed the sections'))
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
        name: 'section',
        getValue: data => data.section.name, // see actions for listView
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
            helpText: 'Section, Name'
        },
        {
            name: 'section',
            label: 'Section',
            field: 'Select',
            /* we manually build the available options. please note that you could also
            use a connector, making this a one-liner */
            lazy: () => crudl.connectors.sections.read(crudl.req()).then(res => ({
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
        lazy: () => crudl.connectors.sections.read(crudl.req()).then(res => ({
            options: res.data.map(section => ({
                value: section.id,
                label: section.name,
            }))
        })),
        add: {
            title: 'New section',
            actions: {
                add: req => crudl.connectors.sections.create(req).then(res => res.data.id),
            },
            fields: [
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
                    helpText: <span>If left blank, the slug will be automatically generated.
                    More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.</span>,
                },
            ],
        },
        edit: {
            title: 'Section',
            actions: {
                get: (req) => crudl.connectors.section(crudl.context('section')).read(req),
                save: (req) => crudl.connectors.section(crudl.context('section')).update(req).then(res => res.data.id),
            },
            fields: [
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
                    helpText: <span>If left blank, the slug will be automatically generated.
                    More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.</span>,
                },
            ],
        },
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
        helpText: <span>If left blank, the slug will be automatically generated.
            More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.</span>,
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
