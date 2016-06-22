var utils = require('../utils')

//-------------------------------------------------------------------
var listView = {
    path: 'tags',
    title: 'Tags',
    actions: {
        list: function (req, cxs) {
            let tags = cxs.tags.read(req)
            return tags
        },
    }
}

listView.fields = [
    {
        name: 'user',
        label: 'User',
    },
    {
        name: 'name',
        label: 'Name',
        main: true,
    },
    {
        name: 'slug',
        label: 'Slug',
    },
]

listView.filters = {
    fields: [
        {
            name: 'user',
            label: 'User',
            field: 'Select',
            actions: {
                asyncProps: (req, cxs) => cxs.users.read(req.filter('limit', '1000'))
                .then(res => res.set('data', {
                    options: res.data.map(user => ({
                        value: user.id,
                        label: user.username,
                    }))
                }))
            },
            initialValue: '',
        },
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'tags/:id',
    title: 'Tag',
    actions: {
        get: function (req, cxs) { return cxs.tag(req.id).read(req) },
        delete: function (req, cxs) { return cxs.tag(req.id).delete(req) },
        save: function (req, cxs) { return cxs.tag(req.id).update(req) },
    },
}

changeView.fields = [
    {
        name: 'name',
        label: 'Name',
        field: 'String',
    },
    {
        name: 'slug',
        label: 'Slug',
        field: 'String',
    },
    {
        name: 'user',
        label: 'User',
        field: 'Autocomplete',
        actions: {
            select: (req, cxs) => {
                return Promise.all(req.data.selection.map(item => {
                    return cxs.user(item.value).read(req)
                    .then(res => res.set('data', {
                        value: res.data.id,
                        label: res.data.username,
                    }))
                }))
            },
            search: (req, cxs) => {
                return cxs.users.read(req.filter('username', req.data.query))
                .then(res => res.set('data', res.data.map(user => ({
                    value: user.id,
                    label: user.username,
                }))))
            }
        }
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'tags/new',
    title: 'New Tag',
    fields: changeView.fields,
    actions: {
        add: function (req, cxs) { return cxs.tags.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
