import { numberedPagination, urlQuery, transformErrors } from '../utils'

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

module.exports = {
    // USERS
    users: {
        url: 'users/',
        pagination: numberedPagination,
        transform: transform(data => data.results),
    },
    user: {
        url: 'users/:id/',
        transform: transform(),
    },

    // SECTIONS
    sections: {
        url: 'sections/',
        urlQuery,
        pagination: numberedPagination,
        transform: transform(data => data.results),
    },
    section: {
        url: 'sections/:id/',
        transform: transform(),
    },

    // CATEGORIES
    categories: {
        url: 'categories/',
        urlQuery,
        pagination: numberedPagination,
        enableDepagination: true,
        transform: transform(data => data.results),
    },
    category: {
        url: 'categories/:id/',
        transform: transform(),
    },

    // TAGS
    tags: {
        url: 'tags/',
        urlQuery,
        pagination: numberedPagination,
        transform: transform(data => data.results),
    },
    tag: {
        url: 'tags/:id/',
        transform: transform(),
    },

    // ENTRIES
    entries: {
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
    entry: {
        url: 'entries/:id/',
        transform: transform(),
    },

    // ENTRIELINKS
    links: {
        url: 'entrylinks/',
        pagination: numberedPagination,
        enableDepagination: true,
        transform: transform(data => data.results),
    },
    link: {
        url: 'entrylinks/:id/',
        transform: transform(),
    },

    // SPECIAL CONNECTORS
    // a helper for retrieving the sections used with select fields
    sectionsOptions: {
        url: 'sections/',
        transform: transform(data => ({
            options: data.results.map(function(item) {
                return { value: item.id, label: item.name }
            }),
        })),
    },
    // a helper for retrieving the categories used with select fields
    categoriesOptions: {
        url: 'categories/',
        transform: transform(data => ({
            options: data.results.map(function(item) {
                return { value: item.id, label: item.name }
            }),
        })),
    },
    // a helper for retrieving the tags used with select fields
    tagsOptions: {
        url: 'tags/',
        transform: transform(data => ({
            options: data.results.map(function(item) {
                return { value: item.id, label: item.name }
            }),
        })),
    },
    // a helper for retrieving the users used with select fields
    usersOptions: {
        url: 'users/',
        transform: transform(data => ({
            options: data.results.map(function(item) {
                return { value: item.id, label: item.username }
            }),
        })),
    },

    // AUTHENTICATION
    login: {
        url: '/rest-api/login/',
        mapping: { read: 'post', },
        transform: transform(data => ({
            requestHeaders: { "Authorization": `Token ${data.token}` },
            info: data,
        })),
    },
}
