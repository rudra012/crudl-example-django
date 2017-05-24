import { formatDate, select } from '../utils'
import React from 'react'

import { createResourceConnector, createOptionsConnector } from '../connectors'
import continuousPagination from '../connectors/middleware/continuousPagination'

const entries = createResourceConnector('entries', `
    id, originalId, title, status, date, sticky, summary, body, createdate, updatedate,
    counterLinks, counterTags,
    section{id, name},
    category{id, name},
    owner{originalId, username},
    tags{id}
`)
.use(continuousPagination(20)) // page limit 20

const links = createResourceConnector('entrylinks', 'id, title, url, entry{id}')
const tags = createResourceConnector('tags', 'id, name')
const categories = createResourceConnector('categories', 'id, name, slug')

const sectionOptions = createOptionsConnector('sections', 'id', 'name')
const categoryOptions = createOptionsConnector('categories', 'id', 'name')
const tagsOptions = createOptionsConnector('tags', 'id', 'name')

//-------------------------------------------------------------------
var listView = {
    path: 'entries',
    title: 'Blog Entries',
    actions: {
        list: function (req) {
            return entries.read(req)
            .then(items => items.map((item) => {
                item.is_owner = crudl.auth.user === item.owner.originalId
                return item
            }))
        },
    },
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
        name: 'category',
        getValue: select('category.name'),
        label: 'Category',
    },
    {
        name: 'title',
        label: 'Title',
        main: true,
        sortable: true,
        sorted: 'ascending',
        sortpriority: '1',
    },
    {
        name: 'status',
        label: 'Status',
    },
    {
        name: 'date',
        label: 'Date',
    },
    {
        name: 'sticky',
        label: 'Sticky',
        render: 'boolean',
    },
    {
        name: 'is_owner',
        label: 'Owner',
        render: 'boolean',
    },
    {
        name: 'counterLinks',
        label: 'No. Links',
        render: 'number',
    },
    {
        name: 'counterTags',
        label: 'No. Tags',
        render: 'number',
    },
]

listView.filters = {
    denormalize: (data) => {
        // Convert sticky to boolean
        if (data.sticky) {
            data.sticky = data.sticky == 'true'
        }
        return data
    },

    fields: [
        {
            name: 'search',
            label: 'Search',
            field: 'Search',
            helpText: 'Section, Category, Title'
        },
        {
            name: 'section',
            label: 'Section',
            field: 'Select',
            lazy: () => sectionOptions.read(crudl.req())
        },
        {
            name: 'category',
            label: 'Category',
            field: 'Select',
            /* this field depends on section (so we add a watch function in
            order to react to any changes on the field section). */
            onChange: [
                {
                    in: 'section',
                    // set the value to '' if the user changed the section
                    setValue: (section) => {
                        return (section.value !== section.initialValue) ? '' : undefined
                    },
                    setProps: (section) => {
                        if (!section.value) {
                            return {
                                readOnly: true,
                                helpText: 'In order to select a category, you have to select a section first',
                            }
                        }
                        // Get the catogories options filtered by section
                        return categoryOptions.read(crudl.req().filter('section', section.value))
                        .then(res => {
                            if (res.options.length > 0) {
                                return {
                                    readOnly: false,
                                    helpText: 'Select a category',
                                    ...res,
                                }
                            } else {
                                return {
                                    readOnly: true,
                                    helpText: 'No categories available for the selected section.'
                                }
                            }
                        })
                    }
                }
            ],
        },
        {
            name: 'status',
            label: 'Status',
            field: 'Select',
            options: [
                {value: '0', label: 'Draft'},
                {value: '1', label: 'Online'}
            ]
        },
        {
            name: 'date_Gt',
            label: 'Published after',
            field: 'Date',
            /* simple date validation (please note that this is just a showcase,
            we know that it does not check for real dates) */
            validate: (value, allValues) => {
                const dateReg = /^\d{4}-\d{2}-\d{2}$/
                if (value && !value.match(dateReg)) {
                    return 'Please enter a date (YYYY-MM-DD).'
                }
            }
        },
        {
            name: 'sticky',
            label: 'Sticky',
            field: 'Select',
            options: [
                {value: 'true', label: 'True'},
                {value: 'false', label: 'False'}
            ],
            helpText: 'Note: We use Select in order to distinguish false and none.'
        },
        {
            name: 'summary_Icontains',
            label: 'Search (Summary)',
            field: 'Search',
        },
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'entries/:id',
    title: 'Blog Entry',
    tabtitle: 'Main',
    actions: {
        get: req => entries(crudl.path.id).read(req),
        delete: req => entries.delete(req), // the request contains the id already
        save: req => entries.update(req), // the request contains the id already
    },
    validate: function (values) {
        if ((!values.category || values.category == "") && (!values.tags || values.tags.length == 0)) {
            return { _error: 'Either `Category` or `Tags` is required.' }
        }
    },
    denormalize: function (data) {
        /* prevent unknown field ... with query */
        delete(data.updatedate)
        delete(data.owner)
        delete(data.createdate)
        return data
    },
}

changeView.fieldsets = [
    {
        fields: [
            {
                name: 'id',
                hidden: true,
            },
            {
                name: 'title',
                label: 'Title',
                field: 'Text',
                required: true,
            },
            {
                name: 'status',
                label: 'Status',
                field: 'Select',
                required: true,
                initialValue: 'Draft',
                /* set options manually */
                options: [
                    {value: 'Draft', label: 'Draft'},
                    {value: 'Online', label: 'Online'}
                ]
            },
            {
                name: 'section',
                getValue: select('section.id'),
                label: 'Section',
                field: 'Select',
                /* we set required to false, although this field is actually
                required with the API. */
                required: false,
                lazy: () => sectionOptions.read(crudl.req()).then(res => ({
                    helpText: 'Select a section',
                    ...res,
                }))
            },
            {
                name: 'category',
                getValue: select('category.id'),
                label: 'Category',
                field: 'Autocomplete',
                required: false,
                showAll: true,
                helpText: 'Select a category',
                /* FIXME: make it easier to reference fields/fieldsets */
                onChange: listView.filters.fields[2].onChange,
                actions: {
                    select: (req) => {
                        return categoryOptions.read(req
                            .filter('idIn', req.data.selection.map(item => item.value).toString()))
                        .then(({ options }) => options)
                    },
                    search: (req) => {
                        if (!crudl.context.data.section) {
                            return Promise.resolve({data: []})
                        } else {
                            return categories.read(req
                                .filter('name', req.data.query)
                                .filter('section', crudl.context.data.section))
                            .then(data => data.map(d => ({
                                value: d.id,
                                label: <span><b>{d.name}</b> ({d.slug})</span>,
                            })))
                        }
                    },
                },
            },
        ],
    },
    {
        title: 'Content',
        expanded: true,
        fields: [
            {
                name: 'date',
                label: 'Date',
                field: 'Date',
                required: true,
                initialValue: () => formatDate(new Date()),
                formatDate: formatDate
            },
            {
                name: 'sticky',
                label: 'Sticky',
                field: 'Checkbox',
            },
            {
                name: 'summary',
                label: 'Summary',
                field: 'Textarea',
                validate: (value, allValues) => {
                    if (!value && allValues.status == 'Online') {
                        return 'The summary is required with status "Online".'
                    }
                }
            },
            {
                name: 'body',
                label: 'Body',
                field: 'Textarea',
                validate: (value, allValues) => {
                    if (!value && allValues.status == 'Online') {
                        return 'The summary is required with status "Online".'
                    }
                }
            },
            {
                name: 'tags',
                getValue: select('tags[*].id'),
                label: 'Tags',
                field: 'AutocompleteMultiple',
                required: false,
                showAll: false,
                helpText: 'Select a tag',
                actions: {
                    search: (req) => {
                        return tagsOptions.read(req
                            .filter('name', req.data.query.toLowerCase()))
                        .then(({ options }) => options)
                    },
                    select: (req) => {
                        return tagsOptions.read(req
                            .filter('idIn', req.data.selection.map(item => item.value).toString()))
                        .then(({ options }) => options)
                    },
                },
            }
        ]
    },
    {
        title: 'Internal',
        expanded: false,
        fields: [
            {
                name: 'createdate',
                label: 'Date (Create)',
                field: 'Datetime',
                disabled: true,
            },
            {
                name: 'updatedate',
                label: 'Date (Update)',
                field: 'Datetime',
                disabled: true,
            },
        ]
    }
]

changeView.tabs = [
    {
        title: 'Links',
        actions: {
            list: (req) => links.read(req.filter('entry', crudl.path.id)),
            add: (req) => links.create(req),
            save: (req) => links.update(req),
            delete: (req) => links.delete(req)
        },
        itemTitle: '{url}',
        fields: [
            {
                name: 'url',
                label: 'URL',
                field: 'URL',
                link: true,
            },
            {
                name: 'title',
                label: 'Title',
                field: 'String',
            },
            {
                name: 'id',
                hidden: true,
            },
            {
                name: 'entry',
                hidden: true,
                initialValue: () => crudl.context.data.id,
            },
        ],
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'entries/new',
    title: 'New Blog Entry',
    fieldsets: changeView.fieldsets,
    validate: changeView.validate,
    actions: {
        add: function (req) { return entries.create(req) },
    },
    denormalize: (data) => {
        /* set owner on add. alternatively, we could manipulate the data
        with the connector by using createRequestData (see connectors.js) */
        if (crudl.auth.user) data.owner = crudl.auth.user
        return data
    }
}

//-------------------------------------------------------------------
module.exports = {
    listView,
    addView,
    changeView,
}
