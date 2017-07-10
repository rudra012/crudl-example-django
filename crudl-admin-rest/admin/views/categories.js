import { join, slugify } from '../utils'
import React from 'react'
import { list, detail, options } from '../connectors'

const categories = list('categories');
const category = detail('categories'); // The id parameter is not yet bound
const sections = list('sections');
const section = detail('sections'); // The id parameter is not yet bound

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
        list: req => join(categories.read(req), sections.read(crudl.req()), 'section', 'id'),
    },
    // bulkActions: {
    //     delete: {
    //         description: 'Delete selected',
    //         modalConfirm: {
    //             message: "All the selected items will be deleted. This action cannot be reversed!",
    //             modalType: 'modal-delete',
    //             labelConfirm: "Delete All",
    //         },
    //         action: selection => Promise.all(selection.map(
    //             item => category(item.id).delete(crudl.req())
    //         ))
    //     },
    //     changeSection: {
    //         description: 'Change Section',
    //         before: (selection) => ({ onProceed, onCancel }) => (
    //             <div>
    //                 {crudl.createForm({
    //                     id: 'select-section',
    //                     title: 'Select Section',
    //                     fields: [{
    //                         name: 'section',
    //                         label: 'Section',
    //                         field: 'Select',
    //                         lazy: () => options('sections', 'id', 'name').read(crudl.req()),
    //                     }],
    //                     onSubmit: values => onProceed(
    //                         selection.map(s => Object.assign({}, s, { section: values.section }))
    //                     ),
    //                     onCancel,
    //                 })}
    //             </div>
    //         ),
    //         action: (selection) => {
    //             return Promise.all(selection.map(
    //                 item => category(item.id).update(crudl.req(item)))
    //             ).then(() => crudl.successMessage('Successfully changed the sections'))
    //         },
    //     },
    // }
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
            use a connector, making this a one-liner (see bellow) */
            lazy: () => sections.read(crudl.req()).then(data => ({
                options: data.map(section => ({
                    value: section.id,
                    label: section.name,
                }))
            })),
            // The one-liner alternative:
            // lazy: () => options('sections', 'id', 'name').read(crudl.req()),
            initialValue: '',
        },
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'categories/:id',
    title: 'Category',
    actions: {
        get: (req) => category(crudl.path.id).read(req),
        delete: (req) => category(crudl.path.id).delete(req),
        save: (req) => category(crudl.path.id).update(req),
    },
}

changeView.fields = [
    {
        name: 'section',
        label: 'Section',
        field: 'Select',
        required: true,
        lazy: () => options('sections', 'id', 'name').read(crudl.req()),
        // add: {
        //     title: 'New section',
        //     actions: {
        //         add: req => sections.create(req).then(data => data.id),
        //     },
        //     fields: [
        //         {
        //             name: 'name',
        //             label: 'Name',
        //             field: 'String',
        //             required: true
        //         },
        //         {
        //             name: 'slug',
        //             label: 'Slug',
        //             field: 'String',
        //             onChange: {
        //                 in: 'name',
        //                 setInitialValue: (name) => slugify(name.value),
        //             },
        //             helpText: <span>If left blank, the slug will be automatically generated.
        //             More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.</span>,
        //         },
        //     ],
        // },
        // edit: {
        //     title: 'Section',
        //     actions: {
        //         get: (req) => section(crudl.context('section')).read(req),
        //         save: (req) => section(crudl.context('section')).update(req),
        //     },
        //     fields: [
        //         {
        //             name: 'name',
        //             label: 'Name',
        //             field: 'String',
        //             required: true
        //         },
        //         {
        //             name: 'slug',
        //             label: 'Slug',
        //             field: 'String',
        //             onChange: {
        //                 in: 'name',
        //                 setInitialValue: (name) => slugify(name.value),
        //             },
        //             helpText: <span>If left blank, the slug will be automatically generated.
        //             More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.</span>,
        //         },
        //     ],
        // },
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
        add: categories.create,
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
