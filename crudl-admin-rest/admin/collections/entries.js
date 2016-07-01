var utils = require('../utils')

function join(p1, p2, var1, var2) {
    return Promise.all([p1, p2])
    .then(responses => {
        return responses[0].set('data', responses[0].data.map(item => {
            item[var1] = responses[1].data.find(obj => obj[var2] == item[var1])
            return item
        }))
    })
}

function transform(p, func) {
    return p.then(response => {
        return response.set('data', response.data.map(func))
    })
}

//-------------------------------------------------------------------
var listView = {
    path: 'entries',
    title: 'Blog Entries',
    actions: {
        list: function (req, cxs) {
            let entries = cxs.entries.read(req)
            let users = cxs.users.read(req.paginate(false))
            let categories = cxs.categories.read(req.paginate(false).filter('limit', 10000))
            let combined = utils.join(utils.join(entries, users, 'user', 'id'), categories, 'category', 'id')
            let withCustomColumn = transform(combined, (item) => {
                item.is_owner = req.authInfo.user == item.user.id
                return item
            })
            return withCustomColumn
        },
    },
    normalize: (item) => {
        item.random = Math.random() >= 0.5
        return item
    }
}

listView.fields = [
    {
        name: 'user',
        key: 'user.username',
        label: 'User',
    },
    {
        name: 'title',
        label: 'Title',
        sortable: true,
        sorted: 'ascending',
        sortpriority: '2',
    },
    {
        name: 'date',
        label: 'Date',
    },
    {
        name: 'category',
        key: 'category.name',
        label: 'Category',
        main: true,
        sortable: true,
        sorted: 'descending',
        sortpriority: '1',
    },
    {
        name: 'is_owner',
        label: 'Are you the owner?',
        render: 'boolean',
    },
    {
        name: 'random',
        label: 'Random',
        render: 'boolean',
    },
]

listView.filters = {
    fields: [
        {
            name: 'user',
            label: 'User',
            field: 'Select',
            actions: {
                asyncProps: (req, cxs) => cxs.users_options.read(req),
            },
        },
        {
            name: 'date_gt',
            label: 'Published after',
            field: 'Date',
        },
        {
            name: 'search',
            label: 'Search',
            field: 'Search',
        },
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'entries/:id',
    title: 'Blog Entry',
    actions: {
        get: function (req, cxs) { return cxs.entry(req.id).read(req) },
        delete: function (req, cxs) { return cxs.entry(req.id).delete(req) },
        save: function (req, cxs) { return cxs.entry(req.id).update(req) },
    },
}

changeView.fieldsets = [
    {
        fields: [
            {
                name: 'id',
                field: 'hidden',
            },
            {
                name: 'title',
                label: 'Title',
                field: 'Text',
                required: true,
            },
            {
                name: 'user',
                label: 'User',
                field: 'Select',
                required: false,
                initialValue: (context) => context.auth.user,
                props: {
                    helpText: 'Select a user'
                },
                actions: {
                    asyncProps: (req, cxs) => cxs.users.read(req.filter('limit', 10000))
                    .then(res => res.set('data', {
                        options: res.data.map(user => (
                            {
                                value: user.id,
                                label: user.username,
                            }
                        ))
                    })),
                },
            },
            {
                name: 'category',
                label: 'Category',
                field: 'Autocomplete',
                required: false,
                props: {
                    showAll: true,
                    helpText: "Select a category",
                },
                watch: [
                    {
                        for: 'user',
                        setValue: '',
                        setProps: user => ({
                            readOnly: !user,
                            helpText: !user ? "In order to select a category, you have to select a user first" : "Select a category",
                        }),
                    }
                ],
                actions: {
                    select: (req, cxs) => {
                        return Promise.all(req.data.selection.map(item => {
                            return cxs.category(item.value).read(req)
                            .then(res => res.set('data', {
                                value: res.data.id,
                                label: res.data.name,
                            }))
                        }))
                    },
                    search: (req, cxs) => {
                        if (!req.context.user) {
                            return Promise.resolve({data: []})
                        } else {
                            return cxs.categories.read(req
                                .filter('name', req.data.query)
                                .filter('user', req.context.user))
                                .then(res => res.set('data', res.data.map(d => ({
                                    value: d.id,
                                    label: `<b>${d.name}</b> (${d.slug})`,
                                }))))
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
                    initialValue: () => utils.formatDate(new Date()),
                    props: {
                        formatDate: utils.formatDate
                    }
                },
                {
                    name: 'body',
                    label: 'Text',
                    field: 'Textarea',
                },
                {
                    name: 'tags',
                    label: 'Tags',
                    field: 'AutocompleteMultiple',
                    required: false,
                    props: {
                        showAll: false,
                        helpText: "Select a category",
                    },
                    actions: {
                        search: (req, cxs) => {
                            return cxs.tags_options.read(req)
                            .then(res => res.set('data', res.data.filter(tag => {
                                return tag.label.toLowerCase().indexOf(req.data.query.toLowerCase()) >= 0
                            })))
                        },
                        select: (req, cxs) => {
                            return Promise.all(req.data.selection.map(item => {
                                return cxs.tag(item.value).read(req)
                                .then(res => res.set('data', {
                                    value: res.data.id,
                                    label: res.data.name,
                                }))
                            }))
                        },
                    },
                }
            ]
        }
    ]

    changeView.tabs = [
        {
            title: 'Links',
            actions: {
                list: (req, cxs) => cxs.links.read(req.filter('entry', req.id)),
                add: (req, cxs) => cxs.links.create(req),
                save: (req, cxs) => cxs.link(req.data.id).update(req),
                delete: (req, cxs) => cxs.link(req.data.id).delete(req)
            },
            itemTitle: '{url}',
            fields: [
                {
                    name: 'url',
                    label: 'URL',
                    field: 'URL',
                    props: {
                        link: true,
                    },
                },
                {
                    name: 'title',
                    label: 'Title',
                    field: 'String',
                },
                {
                    name: 'id',
                    field: 'hidden',
                },
                {
                    name: 'entry',
                    field: 'hidden',
                    initialValue: (context) => context.data.id,
                },
            ],
            // fieldsets: [
            //     {
            //         title: 'Original',
            //         expanded: true,
            //         fields: [
            //             {
            //                 name: 'url',
            //                 label: 'URL',
            //                 field: 'URL',
            //                 props: {
            //                     link: true,
            //                 },
            //             },
            //             {
            //                 name: 'title',
            //                 label: 'Title',
            //                 field: 'String',
            //             },
            //         ]
            //     },
            //     {
            //         title: 'Senseless Copy',
            //         expanded: true,
            //         fields: [
            //             {
            //                 name: 'urlX',
            //                 label: 'URL',
            //                 field: 'URL',
            //                 props: {
            //                     link: true,
            //                 },
            //             },
            //             {
            //                 name: 'titleX',
            //                 label: 'Title',
            //                 field: 'String',
            //             },
            //         ]
            //     }
            // ]
        },
    ]

    //-------------------------------------------------------------------
    var addView = {
        path: 'entries/new',
        title: 'New Blog Entry',
        fieldsets: changeView.fieldsets,
        actions: {
            add: function (req, cxs) { return cxs.entries.create(req) },
        },
    }

    //-------------------------------------------------------------------
    module.exports = {
        listView,
        addView,
        changeView,
    }
