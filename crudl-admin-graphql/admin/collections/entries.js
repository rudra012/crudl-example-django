//-------------------------------------------------------------------
var listView = {
    path: 'entries',
    title: 'Blog Entries',
    actions: {
        list: (req, cxs) => cxs.entries.read(req),
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
        get: (req, cxs) => cxs.entry(req.id).read(req),
        delete: (req, cxs) => cxs.entry(req.id).delete(req),
        save: (req, cxs) => cxs.entry(req.id).update(req),
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
            asyncProps: (req, cxs) => Promise.resolve([]),
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
        add: (req, cxs) => cxs.entries.create(req),
    },
}

module.exports = {
    listView,
    changeView,
    addView,
}
