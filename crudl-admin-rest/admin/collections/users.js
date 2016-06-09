//-------------------------------------------------------------------
var listView = {
    path: 'users',
    title: 'Users',
    actions: {
        list: function (req, connexes) { return connexes.users.read(req) },
    },
    normalize: (list) => list.map(item => {
        item.full_name = item.last_name + ', ' + item.first_name
        item.full_name = item.full_name.replace(/(^, )|(, $)/, '')
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
            if (error.first_name)
                error.full_name = 'First name: ' + error.first_name
            if (error.last_name)
                error.full_name = 'Last name: ' + error.last_name
            throw error
        }
        // full_name
        data.full_name = data.last_name + ', ' + data.first_name
        data.full_name = data.full_name.replace(/(^, )|(, $)/, '')
        // split date_joined into date_joined and time_joined
        let T = data.date_joined.indexOf('T')
        data.time_joined = data.date_joined.slice(T+1, T+6)
        data.day_joined = data.date_joined.slice(0, T)
        return data
    },
    denormalize: (data) => {
        let index = data.full_name.indexOf(',')
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
                validate: (value) => {
                    if (!value || value.indexOf(',') < 0) {
                        return 'The required format is <Last name>, <First name>'
                    }
                },
            },
            {
                name: 'email',
                label: 'Email address',
                field: 'String',
            },
            {
                name: 'password',
                label: 'Password',
                field: 'Password',
                props: {
                    helpText: "Raw passwords are not stored, so there is no way to see this user's password, but you can change the password using <a href'#'>this form</a>."
                }
            }
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
            {
                name: 'day_joined',
                label: 'Date joined',
                field: 'Date',
                readOnly: true,
            },
            {
                name: 'time_joined',
                label: 'Time joined',
                field: 'Text',
                readOnly: true,
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
