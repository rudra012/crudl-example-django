export function join(p1, p2, var1, var2, defaultValue={}) {
    return Promise.all([p1, p2])
    .then(data => {
        return data[0].map(item => {
            item[var1] = data[1].find(obj => obj[var2] == item[var1])
            if (!item[var1]) {
                item[var1] = defaultValue
            }
            return item
        })
    })
}

// Credits for this function go to https://gist.github.com/mathewbyrne
export function slugify(text) {
    if (typeof text !== 'undefined') {
        return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    }
    return undefined
}

export function formatDate(date) {
    return date.toJSON().slice(0, 10)
}
