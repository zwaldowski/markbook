import commander from 'commander'
// import { description, version } from '../package.json'
import clean from './cmd/clean.js'
import epub from './cmd/epub.js'
import init from './cmd/init.js'

commander
  // Add version
  .version(0.1, '-v, --version')
  // Add description
  .description('blah')

commander
  .command('clean [dir]')
  .description("Delete a book's outputs")
  .action(clean)

commander
  .command('epub [dir]')
  .description('Generate an ePub file')
  .option('-o, --open', 'Open in the book in a book reader')
  .action(epub)

commander
  .command('init [dir]')
  .description('Create a new book')
  .option('-a, --author <name>', 'Author name')
  .option('-T, --title <title>', 'Book title')
  .option('-d, --description <text>', 'Book description')
  .action(init)

commander.parse(process.argv)
if (process.argv.length < 3) {
  commander.help()
}
