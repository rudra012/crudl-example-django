//-------------------------------------------------------------------
var listView = {
    path: 'users',
    title: 'Users',
    actions: {
        list: function (req, connexes) { return connexes.users.read(req) },
    },
    normalize: (list) => list.map(item => {
        item.full_name = item.last_name + ', ' + item.first_name
        return item
    })
}

listView.fields = [
    {
        name: 'username',
        label: 'Username',
        main: true,
    },
    {
        name: 'full_name',
        label: 'Full name',
    },
    {
        name: 'email',
        label: 'Email address',
    },
    {
        name: 'is_staff',
        label: 'Staff member',
        render: 'boolean',
    },
    {
        name: 'is_active',
        label: 'Active',
        render: 'boolean',
    },
]

//-------------------------------------------------------------------
var changeView = {
    path: 'users/:id',
    title: 'User',
    actions: {
        get: function (req, connexes) { return connexes.user.read(req) },
        /* FIXME: delete should throw a warning with related objects (intermediary page) */
        delete: function (req, connexes) { return connexes.user.delete(req) },
        save: function (req, connexes) { return connexes.user.update(req) },
    },
    normalize: (data, error) => {
        if (error) {
            if (error.first_name) {
                error.full_name = 'First name: ' + error.first_name
            }
            throw error
        }
        data.full_name = data.last_name + ', ' + data.first_name
        return data
    },
    denormalize: (data) => {
        let index = data.full_name.indexOf(',')
        if (index < 0) {
            throw ({
                full_name: 'The required format is <Last name>, <First name>'
            })
        }
        data.last_name = data.full_name.slice(0, index)
        data.first_name = data.full_name.slice(index+1)
        return data
    }
}

changeView.fieldsets = [
    {
        fields: [
            {
                name: 'username',
                label: 'Username',
                field: 'String',
            },            
        ],
    },
    {
        fields: [
            {
                name: 'full_name',
                label: 'Name',
                field: 'String',
            },
            {
                name: 'email',
                label: 'Email address',
                field: 'String',
            },
        ],
    },
    {
        title: 'Roles',
        expanded: true,
        fields: [
            {
                name: 'is_staff',
                label: 'Staff member',
                field: 'Checkbox',
            },
            {
                name: 'is_active',
                label: 'Active',
                field: 'Checkbox',
            },
        ],
    },
    {
        title: 'More...',
        expanded: false,
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        fields: [
            /* FIXME: date_joined should be read only with the frontend */
            {
                name: 'date_joined',
                label: 'Date joined',
                field: 'Date',
            },
        ],
    }
]

//-------------------------------------------------------------------
var addView = {
    path: 'users/new',
    title: 'New User',
    fieldsets: changeView.fieldsets,
    actions: {
        add: function (req, connexes) { return connexes.users.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
