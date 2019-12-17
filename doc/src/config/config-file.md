# Markbook Config File

The root of every Markbook project.

Every book must contain a file named `markbook.yml` or `markbook.toml` in the root.

## Fields

`identifier`
* Type: String
* Required: Yes
* Description: Primary identifier used to identify major releases of the book in certain formats.

`title`
* Type: String
* Required: Yes
* Description: Book title.

`description`
* Type: String
* Required: No
* Description: Book description

`authors`
* Type: Array of Strings
* Required: Yes
* Description: List of book author's. Must include at least one author.

`language`
* Type: String
* Required: No
* Description: ISO code of the book's language, defaults to `en`

## Planned

`version`
* Type: String
* Required: No
* Description: Book revision. Used to identify different published versions.

`markbook`
* Type: Number
* Required: Yes
* Description: Config file version. Currently only `1`. Used to identify which version of the config file format to used. Used to ensure forward compatibility.
