import { slugify, select } from '../utils'
import React from 'react'

import { createResourceConnector, createOptionsConnector } from '../connectors'

const categories = createResourceConnector('categories', `
    id, originalId, name, slug, position, counterEntries,
    section{id,name}
`)
const sectionOptions = createOptionsConnector('sections', 'id', 'name')

//-------------------------------------------------------------------
var listView = {
    path: 'categories',
    title: 'Categories',
    actions: {
        list: categories.read,
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
                item => categories(item.id).delete(crudl.req()).then(
                    () => crudl.successMessage(`Deleted ${selection.length} items.`)
                )
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
                            lazy: () => sectionOptions.read(crudl.req()),
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
                    item => categories(item.id).update(crudl.req({ section: item.section })))
                ).then(() => crudl.successMessage('Successfully changed the sections'))
            },
        },
    }
}

listView.fields = [
    {
        name: 'originalId',
        label: 'ID',
    },
    {
        name: 'section',
        getValue: select('section.name'),
        label: 'Section',
    },
    {
        name: 'name',
        label: 'Name',
        main: true,
        sortable: true,
        sorted: 'ascending',
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
            name: 'search',
            label: 'Search',
            field: 'Search',
            helpText: 'Section, Name',
        },
        {
            name: 'section',
            label: 'Section',
            field: 'Select',
            lazy: () => sectionOptions.read(crudl.req()),
            initialValue: '',
        },
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'categories/:id',
    title: 'Category',
    actions: {
        get: function (req) { return categories(crudl.path.id).read(req) },
        delete: function (req) { return categories(crudl.path.id).delete(req) },
        save: function (req) { return categories(crudl.path.id).update(req) },
    },
}

changeView.fields = [
    {
        name: 'id',
        hidden: true,
    },
    {
        name: 'section',
        getValue: select('section.id'),
        label: 'Section',
        field: 'Select',
        required: true,
        lazy: () => sectionOptions.read(crudl.req()),
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
        add: function (req) { return categories.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
