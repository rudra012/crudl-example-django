import { createDRFConnector, defaults } from 'crudl-connectors-drf'
import { numberedPagination } from 'crudl-connectors-drf/lib/middleware'
import { transformData } from 'crudl-connectors-base/lib/middleware'

defaults.baseURL = '/rest-api/'

export const list = createDRFConnector(':collection/')
    .use(numberedPagination())

export const detail = createDRFConnector(':collection/:id/')

// Resolves to { options: [{value, label}, {value, label}, ... ] }
export const options = (collection, valueKey, labelKey) => list(collection)
    .use(next => ({
        read: req => next.read(req.filter('limit', 1000000)).then(res => Object.assign(res, {
            data: {
                options: res.data.map(item => ({
                    value: item[valueKey],
                    label: item[labelKey],
                }))
            },
        })),
    }))

export const login = createDRFConnector('login/')
    .use(transformData('create',
        data => ({
            requestHeaders: { "Authorization": `Token ${data.token}` },
            info: data,
        })
    ))
