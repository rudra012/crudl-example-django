import { slugify } from '../utils'
import React from 'react'

import { createResourceConnector } from '../connectors'

const sectionFields = 'id, originalId name, slug, counterEntries'
const sections = createResourceConnector('sections', sectionFields)

//-------------------------------------------------------------------
var listView = {
    path: 'sections',
    title: 'Sections',
    actions: {
        list: sections.read,
    }
}

listView.bulkActions = {
    delete: {
        description: 'Delete selected',
        modalConfirm: {
            message: "All the selected items will be deleted. This action cannot be reversed!",
            modalType: 'modal-delete',
            labelConfirm: "Delete All",
        },
        action: (selection) => {
            return Promise.all(selection.map(
                item => sections.delete(crudl.req({ id: item.id })))
            )
            .then(() => crudl.successMessage(`All items (${selection.length}) were deleted`))
        },
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
        get: function (req) { return sections(crudl.path.id).read(req) },
        delete: function (req) { return sections(crudl.path.id).delete(req) },
        save: function (req) { return sections(crudl.path.id).update(req) },
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
        helpText: <span>If left blank, the slug will be automatically generated.
            More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.</span>,
    }
]

//-------------------------------------------------------------------
var addView = {
    path: 'sections/new',
    title: 'New Section',
    fields: changeView.fields,
    actions: {
        add: sections.create,
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
