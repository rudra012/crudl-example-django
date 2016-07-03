
function join(p1, p2, var1, var2, defaultValue={}) {
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

function formatDate(date) {
    return date.toJSON().slice(0, 10)
}

// Format time HH:MM:SS
function formatTime(date) {
    return date.toJSON().slice(11,19)
}

function formatDateTime(date) {
    let d = formatDate(date)
    let t = formatTime(date)
    return d + ', ' + t
}

module.exports = {
    join,
    formatDate,
    formatDateTime,
}
