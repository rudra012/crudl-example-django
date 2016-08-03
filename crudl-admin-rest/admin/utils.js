function url2page(url) {
    let match = /page=(\d+)/.exec(url)
    return match ? parseInt(match[1]) : 1
}

export function continuousPagination(res) {

    let nextPage = res.data.next && url2page(res.data.next)
    // Return the pagination descriptor
    return {
        type: 'continuous',
        next: nextPage,
    }
}

export function numberedPagination(res) {

    // total number of results
    let resultsTotal = res.data.count
    // next page as number
    let nextPage = res.data.next && url2page(res.data.next)
    // previous page as number
    let previousPage = res.data.previous && url2page(res.data.previous)
    // the page size
    let pageSize = res.data.results.length

    // compute the currentPage number and the total number of pages
    let currentPage, pagesTotal
    if (nextPage) { // We're not on the last page
        currentPage = nextPage - 1
        pagesTotal = resultsTotal / pageSize
    } else { // We're on the last page
        currentPage = previousPage ? previousPage + 1 : 1
        pagesTotal = currentPage
    }

    // Compute all page cursors
    let allPages = []
    for (let i = 0; i < pagesTotal; i++) {
        allPages[i] = `${(i+1)}` // We return string, so that the page will be preserved in the path query
    }

    return {
        type: 'numbered',
        allPages,
        currentPage,
        resultsTotal
    }
}


export function urlQuery(req) {
    return Object.assign({},
        req.filters,
        req.page && { page: req.page },
        {
            ordering: req.sorting.map(field => {
                let prefix = field.sorted == 'ascending' ? '' : '-'
                return prefix + field.sortKey
            }).join(',')
        }
    )
}

export function join(p1, p2, var1, var2, defaultValue={}) {
    return Promise.all([p1, p2])
    .then(responses => {
        return responses[0].set('data', responses[0].data.map(item => {
            item[var1] = responses[1].data.find(obj => obj[var2] == item[var1])
            if (!item[var1]) {
                item[var1] = defaultValue
            }
            return item
        }))
    })
}

// Credits for this function go to https://gist.github.com/mathewbyrne
export function slugify(text) {
    return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export function formatDate(date) {
    return date.toJSON().slice(0, 10)
}

export function transformErrors(error) {
    error._error = error.non_field_errors
    return error
}
