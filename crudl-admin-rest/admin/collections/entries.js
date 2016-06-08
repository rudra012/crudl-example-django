//-------------------------------------------------------------------
var listView = {
    path: 'entries',
    title: 'Blog Entries',
    actions: {
        list: function (req, cxs) { return cxs.entries.read(req) },
    },
}

listView.fields = [
    {
        name: 'user',
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
        label: 'Category',
        main: true,
        render: 'number',
        sortable: true,
        sorted: 'descending',
        sortpriority: '1',
    }
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
            initialValue: '',
        },
        {
            name: 'date_gt',
            label: 'Published after',
            field: 'Date',
            initialValue: '',
        },
        {
            name: 'search',
            label: 'Search',
            field: 'Search',
            initialValue: '',
        },
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'entries/:id',
    title: 'Blog Entry',
    actions: {
        get: function (req, cxs) { return cxs.entry.read(req) },
        delete: function (req, cxs) { return cxs.entry.delete(req) },
        save: function (req, cxs) { return cxs.entry.update(req) },
    },
}

changeView.fieldsets = [
   {
       fields: [
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
               props: {
                   canBeNone: true,
                   helpText: 'Select a user'
               },
               actions: {
                   asyncProps: (req, cxs) => cxs.users_options.read(req),
               },
           },
       ],
   },
   {
       title: 'Category',
       expanded: true,
       fields: [
           {
               name: 'category',
               label: 'Category',
               field: 'Autocomplete',
               props: {
                   helpText: "Select a category",
               },
               watch: [
                   {
                       for: 'user',
                       setProps: user => ({
                           disabled: !user,
                           comment: !user ? "In order to select a category, you have to select a user first" : '',
                       }),
                   }
               ],
               actions: {
                   select: (req, cxs) => {
                       return Promise.all(req.data.selection.map(item => {
                           return cxs.category.read(req.with('id', item.value))
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
       title: 'Bla',
       expanded: true,
       fields: [
           {
               name: 'date',
               label: 'Date',
               field: 'Datetime',
           },
           {
               name: 'body',
               label: 'Text',
               field: 'Text',
           },
           {
               name: 'tags',
               label: 'Tags',
               field: 'SelectMultiple',
               props: {
                   multiple: true,
               },
               actions: {
                   asyncProps: (req, cxs) => cxs.tags_options.read(req)
                   .then(res => res.set('data', {
                       options: res.data,
                   })),
               },
           },
       ]
   }
]

changeView.tabs = [
    {
        title: 'Links',
        actions: {
            list: (req, cxs) => {
                req.filter("entry", req.context.id)
                req.paginate(false)
                return cxs.links.read(req)
            },
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
        ]
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
