//-------------------------------------------------------------------
var listView = {
    path: 'entries',
    title: 'Blog Entries',
    actions: {
        list: (req, connexes) => connexes.entries.read(req),
    },
}

listView.fields = [
    {
        name: 'title',
        label: 'Title',
    },
    {
        name: 'date',
        label: 'Date',
    },
    {
        name: 'category',
        label: 'Category',
        key: 'category.name',
    },
]

//-------------------------------------------------------------------
var changeView = {
    path: 'entries/:id',
    title: 'Blog Entry',
    actions: {
        get: (req, connexes) => connexes.entry.read(req),
        delete: (req, connexes) => connexes.entry.delete(req),
        save: (req, connexes) => connexes.entry.update(req),
    },
}

changeView.fields = [
    {
        name: 'title',
        label: 'Title',
        field: 'String',
    },
    {
        name: 'category',
        key: 'category.id',
        label: 'Category',
        field: 'Select',
        actions: {
            asyncProps: (req, connexes) => connexes.categories_options.read(req),
        },
    },
    {
        name: 'date',
        label: 'Date',
        field: 'Date',
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'entries/new',
    title: 'New Blog Entry',
    fields: changeView.fields,
    actions: {
        add: (req, connexes) => connexes.entries.create(req),
    },
}

module.exports = {
    listView,
    changeView,
    addView,
}
