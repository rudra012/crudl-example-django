import options from './admin/options'
import descriptor from './admin/descriptor'
import SplitDateTimeField from './fields/SplitDateTimeField'

Crudl.addField('SplitDateTime', SplitDateTimeField)
Crudl.render(descriptor, options)
