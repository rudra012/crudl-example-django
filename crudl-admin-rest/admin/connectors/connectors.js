
function pagination(res) {

    function url2page(url) {
        let match = /page=(\d+)/.exec(url)
        return match ? parseInt(match[1]) : 1
    }

    let nextPage = res.data.next && url2page(res.data.next)

    // Return the pagination descriptor
    return {
        next: nextPage ? { page: nextPage } : undefined,
    }
}

function urlQuery(req) {
    return Object.assign({},
        req.filters,
        req.page,
        {
            ordering: req.sorting.map(field => {
                let prefix = field.sorted == 'ascending' ? '' : '-'
                return prefix + field.name
            }).join(',')
        }
    )
}

module.exports = [
    {
        id: 'users',
        url: 'users/',
        pagination,
        transform: {
            readResponseData: data => data.results,
        },
    },
    {
        id: 'user',
        url: 'users/:id/',
    },
    {
        id: 'entries',
        url: 'entries/',
        urlQuery,
        pagination,
        transform: {
            readResponseData: data => data.results,
        },
    },
    {
        id: 'entries_options',
        url: 'entries/',
        mapping: {
            read: 'options',
        }
    },
    {
        id: 'entry',
        url: 'entries/:id/',
    },
    {
        id: 'categories',
        url: 'categories/',
        pagination,
        enableDepagination: true,
        transform: {
            readResponseData: data => data.results,
        },
    },
    {
        id: 'category',
        url: 'categories/:id/',
    },
    {
        id: 'allCategories',
        use: 'categories',
    },
    {
        id: 'tags_options',
        use: 'entries_options',
        transform: {
            readResponseData: data => data.actions.POST.tags.choices.map(function (c) {
                return {
                    value: c.value,
                    label: c.display_name,
                }
            }),
        },
    },
    {
        id: 'links',
        url: 'entrylinks/',
        pagination,
        enableDepagination: true,
        transform: {
            readResponseData: data => data.results,
        },
    },
    {
        id: 'link',
        url: 'entrylinks/:id/',
    },
    {
        id: 'tags',
        url: 'tags/',
        pagination,
        transform: {
            readResponseData: data => data.results,
        },
    },
    {
        id: 'tag',
        url: 'tags/:id/',
    },
    {
        id: 'users_options',
        url: 'entries/',
        mapping: { read: 'options', },
        transform: {
            readResponseData: data => ({
                options: data.actions.POST.user.choices.map(function (c) {
                    return {
                        value: c.value,
                        label: c.display_name,
                    }
                }),
            })
        },
    },
    {
        id: 'auth_token',
        url: '/rest-api/api-token-auth/',
        mapping: { read: 'post', },
        transform: {
            readResponseData: data => ({
                requestHeaders: { "Authorization": `Token ${data.token}` },
                authInfo: data,
            })
        }
    }
]
