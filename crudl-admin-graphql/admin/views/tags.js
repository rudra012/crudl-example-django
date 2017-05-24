import { slugify } from '../utils'

import { createResourceConnector } from '../connectors'
import continuousPagination from '../connectors/middleware/continuousPagination'

const tagFields = 'id, originalId, name, slug, counterEntries'
const tags = createResourceConnector('tags', tagFields)
.use(continuousPagination(20))


//-------------------------------------------------------------------
var listView = {
    path: 'tags',
    title: 'Tags',
    actions: {
        list: tags.read,
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

listView.filters = {
    fields: [
        {
            name: 'name',
            label: 'Search',
            field: 'Search',
            helpText: 'Name'
        }
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'tags/:id',
    title: 'Tag',
    actions: {
        get: function (req) { return tags(crudl.path.id).read(req) },
        delete: function (req) { return tags(crudl.path.id).delete(req) },
        save: function (req) { return tags(crudl.path.id).update(req) },
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
    },
    {
        name: 'slug',
        label: 'Slug',
        field: 'String',
        readOnly: true,
        onChange: {
            in: 'name',
            setInitialValue: (name) => slugify(name.value),
        },
        helpText: `Slug is automatically generated when saving the Tag.`,
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'tags/new',
    title: 'New Tag',
    fields: changeView.fields,
    actions: {
        add: tags.create,
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
