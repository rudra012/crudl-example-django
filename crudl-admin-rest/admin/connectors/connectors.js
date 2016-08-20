import { continuousPagination, numberedPagination, urlQuery, transformErrors } from '../utils'

/**
* Transform helper. Takes care of errors and allows a quick definition of the
* data transformation for the read operation.
*/
function transform(readResponseData, other) {

    function transformResponse(res) {
        if (res.status === 400) {
            throw new crudl.ValidationError(transformErrors(res.data))
        }
        return res
    }

    return {
        readResponse: transformResponse,
        createResponse: transformResponse,
        updateResponse: transformResponse,
        deleteResponse: transformResponse,
        readResponseData: readResponseData || (data => data),
        ...other,
    }
}

module.exports = [

    // USERS
    {
        id: 'users',
        url: 'users/',
        pagination: numberedPagination,
        transform: transform(data => data.results),
    },
    {
        id: 'user',
        url: 'users/:id/',
        transform: transform(),
    },

    // SECTIONS
    {
        id: 'sections',
        url: 'sections/',
        urlQuery,
        pagination: numberedPagination,
        transform: transform(data => data.results),
    },
    {
        id: 'section',
        url: 'sections/:id/',
        transform: transform(),
    },

    // CATEGORIES
    {
        id: 'categories',
        url: 'categories/',
        urlQuery,
        pagination: numberedPagination,
        enableDepagination: true,
        transform: transform(data => data.results),
    },
    {
        id: 'category',
        url: 'categories/:id/',
        transform: transform(),
    },
    {
        id: 'allCategories',
        use: 'categories',
    },

    // TAGS
    {
        id: 'tags',
        url: 'tags/',
        urlQuery,
        pagination: continuousPagination,
        transform: transform(data => data.results),
    },
    {
        id: 'tag',
        url: 'tags/:id/',
        transform: transform(),
    },

    // ENTRIES
    {
        id: 'entries',
        url: 'entries/',
        urlQuery,
        pagination: numberedPagination,
        transform: transform(data => data.results, {
            createRequestData: data => {
                if (crudl.auth.user) data.owner = crudl.auth.user
                return data
            }
        }),
    },
    {
        id: 'entry',
        url: 'entries/:id/',
        transform: transform(),
    },

    // ENTRIELINKS
    {
        id: 'links',
        url: 'entrylinks/',
        pagination: numberedPagination,
        enableDepagination: true,
        transform: transform(data => data.results),
    },
    {
        id: 'link',
        url: 'entrylinks/:id/',
        transform: transform(),
    },

    // SPECIAL CONNECTORS

    // sections_options
    // a helper for retrieving the sections used with select fields
    {
        id: 'sections_options',
        url: 'sections/',
        transform: transform(data => ({
            options: data.results.map(function(item) {
                return { value: item.id, label: item.name }
            }),
        })),
    },

    // category_options
    // a helper for retrieving the categories used with select fields
    {
        id: 'categories_options',
        url: 'categories/',
        transform: transform(data => ({
            options: data.results.map(function(item) {
                return { value: item.id, label: item.name }
            }),
        })),
    },

    // tags_options
    // a helper for retrieving the tags used with select fields
    {
        id: 'tags_options',
        url: 'tags/',
        transform: transform(data => ({
            options: data.results.map(function(item) {
                return { value: item.id, label: item.name }
            }),
        })),
    },

    // users_options
    // a helper for retrieving the users used with select fields
    {
        id: 'users_options',
        url: 'users/',
        transform: transform(data => ({
            options: data.results.map(function(item) {
                return { value: item.id, label: item.username }
            }),
        })),
    },

    // AUTHENTICATION
    {
        id: 'login',
        url: '/rest-api/login/',
        mapping: { read: 'post', },
        transform: transform(data => ({
            requestHeaders: { "Authorization": `Token ${data.token}` },
            info: data,
        })),
    },

]
