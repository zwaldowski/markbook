import Handlebars from 'handlebars'

Handlebars.registerHelper('inc', function (value) {
  return parseInt(value) + 1
})

export default Handlebars
