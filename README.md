# Qwik Table
A Qlik Sense extension which automatically creates a custom report using Qlik Sense standard objects. This extension must be downloaded from the releases page found here: https://github.com/rileymd88/qwik-table/releases 

![Qwik Table GIF](https://raw.githubusercontent.com/rileymd88/data/master/qwik-table/qwik-table.gif)

# Developing the extension
If you want to do code changes to the extension follow these simple steps to get going.

1. Get Qlik Sense
2. Clone the repository
3. Run `npm install`
4. Run `npm run build` - to build a dev-version to the /dist folder.

## Release Notes v0.5
* Updated logic to show and hide dimensions

## Release Notes v0.4.1
* Updated node packages

## Release Notes v0.4
* Simplifed automatic table creation by allowing usage of fields, formulas and master items in one interface

## Release Notes v0.3
* Added automatic table creation based off master dimensions and measures (no need to first create a master item table)

## Release Notes v0.2
* Automatic creation of filterpane
* Added properties which allow to choose a name for the dimension and measure data island fields that get created
* Fixed bug which stopped extension from working when there was a drilldown dimension being used
* Fixed bug which stopped extension from working when a dimension with a custom label was being used

## Release Notes v0.1
* First beta release

# Original authors
[github.com/rileymd88](https://github.com/rileymd88)

# License
Released under the [MIT License](LICENSE).
