
function join(p1, p2, var1, var2) {
    return Promise.all([p1, p2])
    .then(responses => {
        return responses[0].set('data', responses[0].data.map(item => {
            item[var1] = responses[1].data.find(obj => obj[var2] == item[var1])
            return item
        }))
    })
}

module.exports = {
    join
}
