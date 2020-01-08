import commander from 'commander'
import { description, version } from '../package.json'
import build from './cmd/build'
import clean from './cmd/clean'
import epub from './cmd/epub'
import init from './cmd/init'

commander
  // Add version
  .version(version, '-v, --version')
  // Add description
  .description(description)

commander.on('--help', () => {
  console.log('')
  console.log('Examples:')
  console.log('  $ markbook --help')
  console.log('')
  console.log(
    "To see the options for a specific command, use 'markbook <cmd> --help'"
  )
  console.log('Such as:')
  console.log('  $ markbook init --help')
})

commander
  .command('build [dir]')
  .description('Build a book')
  .option('-o, --open', 'Open in the book in a web browser')
  .action(build)

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
  .option('-a, --author [author]', 'Author name')
  .option('-T, --title [title]', 'Book title')
  .option('-d, --desc [desc]', 'Book description')
  .option('-t, --theme', 'Copy the theme to the directory')
  .action(init)

commander.parse(process.argv)
if (process.argv.length < 3) {
  commander.help()
}
