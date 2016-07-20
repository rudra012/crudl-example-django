import { join, slugify } from '../utils'

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
        list: function (req, connectors) {
            let categories = connectors.categories.read(req)
            let sections = connectors.sections.read(req)
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
            name: 'section',
            label: 'Section',
            field: 'Select',
            /* we manually build the available options. please note that you could also
            use a connector, making this a one-liner */
            props: (req, connectors) => connectors.sections.read(req).then(res => ({
                options: res.data.map(section => ({
                    value: section.id,
                    label: section.name,
                }))
            })),
            initialValue: '',
        },
    ]
}

listView.search = {
    name: 'search',
}

//-------------------------------------------------------------------
var changeView = {
    path: 'categories/:id',
    title: 'Category',
    actions: {
        get: function (req, connectors) { return connectors.category(req.id).read(req) },
        delete: function (req, connectors) { return connectors.category(req.id).delete(req) },
        save: function (req, connectors) { return connectors.category(req.id).update(req) },
    },
}

changeView.fields = [
    {
        name: 'section',
        label: 'Section',
        field: 'Select',
        required: true,
        /* Here we build the list of possible options with an extra API call */
        props: (req, connectors) => connectors.sections.read(req).then(res => ({
            options: res.data.map(section => ({
                value: section.id,
                label: section.name,
            }))
        }))
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
            setInitialValue: (name) => slugify(name),
        },
        props: {
            helpText: `If left blank, the slug will be automatically generated.
            More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.`,
        }
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'categories/new',
    title: 'New Category',
    fields: changeView.fields,
    actions: {
        add: function (req, connectors) { return connectors.categories.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
