import { formatDate } from '../utils'
import React from 'react'

import { list, detail, options } from '../connectors'

const entries = list('entries');
const entry = detail('entries'); // The id parameter is not yet bound
const links = list('entrylinks');
const link = detail('entrylinks'); // The id parameter is not yet bound
const categories = list('categories');

const sectionOpts = options('sections', 'id', 'name');
const tagOpts = options('tags', 'id', 'name');
const categoryOpts = options('categories', 'id', 'name');

//-------------------------------------------------------------------
var listView = {
    path: 'entries',
    title: 'Blog Entries',
    actions: {
        /* here we add a custom column based on the currently logged-in user */
        list: req => entries.read(req).then((data) => {
            data.forEach((item) => {
                item.is_owner = crudl.auth.user === item.owner
            })
            return data
        })
    },
}

listView.fields = [
    {
        name: 'id',
        label: 'ID',
    },
    {
        name: 'section',
        getValue: (data) => data.section_name,
        label: 'Section',
        sortable: true,
    },
    {
        name: 'category',
        getValue: data => data.category_name,
        label: 'Category',
        sortable: true,
    },
    {
        name: 'title',
        label: 'Title',
        main: true,
        sortable: true,
    },
    {
        name: 'status',
        getValue: data => data.status_name,
        label: 'Status',
        sortable: true,
    },
    {
        name: 'date',
        label: 'Date',
        sortable: true,
        sorted: 'descending',
        sortpriority: '2',
    },
    {
        name: 'sticky',
        label: 'Sticky',
        render: 'boolean',
        sortable: true,
        sorted: 'descending',
        sortpriority: '1',
    },
    {
        name: 'is_owner',
        label: 'Owner',
        render: 'boolean',
    },
    {
        name: 'counter_links',
        label: 'No. Links',
        render: 'number',
    },
    {
        name: 'counter_tags',
        label: 'No. Tags',
        render: 'number',
    },
]

listView.filters = {
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
            lazy: () => sectionOpts.read(crudl.req()),
        },
        {
            name: 'category',
            label: 'Category',
            field: 'Select',
            /* this field depends on a section (so we add a watch function in
            order to react to any changes in the section field). */
            onChange: [
                {
                    in: 'section',
                    // set the value to '' if the user changed the section or the section is not set
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
                        return categoryOpts.read(crudl.req().filter('section', section.value))
                        .then(({ options }) => {
                            if (options.length > 0) {
                                return {
                                    readOnly: false,
                                    helpText: 'Select a category',
                                    options,
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
            name: 'date_gt',
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
            name: 'search_summary',
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
        get: req => entry(crudl.path.id).read(req),
        delete: req => entry(crudl.path.id).delete(req),
        save: req => entry(crudl.path.id).update(req),
    },
    validate: function (values) {
        if ((!values.category || values.category == "") && (!values.tags || values.tags.length == 0)) {
            return { _error: 'Either `Category` or `Tags` is required.' }
        }
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
            // {
            //     name: 'image',
            //     label: 'Image',
            //     field: 'File',
            //     initialValue: { value: undefined },
            //     normalize: image => ({ value: image.name, label: image.name, previewURL: image.url }),
            //     denormalize: field => field.value,
            //     readAs: 'DataURL', // Other options are 'Text', 'ArrayBuffer', see also https://goo.gl/YYrlGu
            //     onSelect: (file, dataURL) => ({
            //         value: { name: file.name, file: dataURL.split(',')[1] },
            //         label: file.name,
            //         previewURL: file.size < 1000000 ? dataURL : undefined,
            //     }),
            // },
            {
                name: 'status',
                label: 'Status',
                field: 'Select',
                required: true,
                initialValue: '0',
                /* set options manually */
                options: [
                    {value: '0', label: 'Draft'},
                    {value: '1', label: 'Online'}
                ]
            },
            {
                name: 'section',
                label: 'Section',
                field: 'Select',
                /* we set required to false, although this field is actually
                required with the API. */
                required: false,
                lazy: () => sectionOpts.read(crudl.req()).then(({ options }) => ({
                    helpText: 'Select a section',
                    options,
                })),
            },
            {
                name: 'category',
                label: 'Category',
                field: 'Autocomplete',
                required: false,
                showAll: true,
                helpText: 'Select a category',
                onChange: listView.filters.fields[2].onChange,
                actions: {
                    select: req => categoryOpts.read(
                        req.filter('id_in', req.data.selection.map(item => item.value).toString())
                    ).then(({ options }) => options),
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
                formatDate,
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
                    if (!value && allValues.status == '1') {
                        return 'The summary is required with status "Online".'
                    }
                }
            },
            {
                name: 'body',
                label: 'Body',
                field: 'Textarea',
                validate: (value, allValues) => {
                    if (!value && allValues.status == '1') {
                        return 'The summary is required with status "Online".'
                    }
                }
            },
            {
                name: 'tags',
                label: 'Tags',
                field: 'AutocompleteMultiple',
                required: false,
                showAll: false,
                helpText: 'Select a tag',
                actions: {
                    search: (req) => {
                        return tagOpts.read(req.filter('name', req.data.query.toLowerCase()))
                        .then(({ options }) => options)
                    },
                    select: (req) => {
                        return tagOpts.read(req
                            .filter('id_in', req.data.selection.map(item => item.value).toString()))
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
            list: req => links.read(req.filter('entry', crudl.path.id)),
            add: req => links.create(req),
            save: req => link(req.data.id).update(req),
            delete: req => link(req.data.id).delete(req),
        },
        getItemTitle: (data) => `${data.url} (${data.title})`,
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
        add: entries.create,
    },
    denormalize: (data) => {
        /* set owner on add. alternatively, we could manipulate the data
        with the connector by using createRequestData (see connectors.js) */
        if (crudl.auth.user) {
            data.owner = crudl.auth.user
        }
        return data
    }
}

//-------------------------------------------------------------------
module.exports = {
    listView,
    addView,
    changeView,
}
