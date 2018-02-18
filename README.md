# Default Stylesheet

Return styles to browser defaults.

## Warning: Work in Progress!

This technique is still a work in progress. Styles for all elements are not yet
completely isolated. Using the Firefox's browser default stylesheet means that
it doesn't quite work as expected in other browsers.

To see the current progress for yourself visit [the example
page](https://thallada.github.io/default-stylesheet/example/index.html).

Alternatively, you can run it yourself by:

```bash
git clone https://github.com/thallada/default-stylesheet
cd default-stylesheet
npm install
npm run build
python -m SimpleHTTPServer 8888
```

Then visit `http://localhost:8888/example/index.html` in your browser.

That said, I've had success using only Bootstrap components on top of this reset
in another project.

## Why this is needed

If you have applied an [`all:
initial`](https://developer.mozilla.org/en-US/docs/Web/CSS/all) reset, the
affected elements will have absolutely no styling because they have been reset
to the element's initial values as defined in the CSS spec (e.g. all elements
will be inline). `all: initial` effectively undoes all styling on an element
including the browser default styling.

Applying this stylesheet after applying an `all: initial` style will return
elements to some sane browser default. It "redoes" the browser default
stylesheet after undoing it.

## Will this work in non-Firefox browsers?

Theoretically yes, you will just end up with a styling that looks a lot like
Firefox. This stylesheet is based upon the [default Firefox
stylesheets](https://dxr.mozilla.org/mozilla-central/source/layout/style/res),
but with modifications to remove `-moz-` prefixes, `%if` blocks, and
Firefox-specific properties.

You can use CSS resets, such as
[normalize.css](https://necolas.github.io/normalize.css/), to normalize the
Firefox styling to a cross-browser default standard.

## Usage

You have two options:

### Import source and process with Webpack (recommended)

Using [Webpack](https://webpack.js.org/) with [PostCSS](http://postcss.org/)
will give you the most control over how this stylesheet is applied.
Additionally, since `all: initial` is only supported by Firefox at the time of
writing, the [`postcss-initial`
plugin](https://github.com/maximkoretskiy/postcss-initial) is necessary to
polyfill it for other browsers.

If you are using `all: initial` to isolate a specific element on the page from
the surrounding CSS cascade, you will likely want to scope it and this
stylesheet to that specific element. This can either be done by nesting
[Sass](https://sass-lang.com/) selectors or by using the
[`postcss-prepend-selector`
plugin](https://www.npmjs.com/package/postcss-prepend-selector).

The advantage of using `postcss-prepend-selector` is that you won't have to wrap
every style in a selector to your embedded element. It will automatically
prepend every selector in your project with the selector at Webpack build-time.

Here is an example of a Sass file that fully resets an embedded element:

```scss
/* Note: Because postcss-prepend-selector is used in this project, all selectors defined in any CSS/SCSS file will have
 * "#embedded.embedded " prepended to them so that all styles here will be scoped to *only* the root div. */

/* reset all element properties to initial values as defined in CSS spec (*not* browser defaults) */
* {
  all: initial;
  /* allow all elements to inherit these properties from the root "body" div */
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
  text-align: left;
  background-color: inherit;
  cursor: inherit;
}

/* apply Firefox's default stylesheet so that Bootstrap has some browser-like styling to work with */
@import '~default-stylesheet/default.css';

/* apply the Bootstrap reboot (normalize.css) to convert Firefox default styling to some cross-browser baseline
 * then, apply the Bootstrap component styling */
@import '~bootstrap/scss/bootstrap';

/* Since elements inside the embedded div can no longer inherit styles set on the <body>, we will apply the styles
 * that the Bootstrap reboot applies to the <body> on the wrapper div instead, which containing elements can inherit.
 *
 * <div id="embedded" class="embedded">
 *   <div class="embedded-wrapper">
 *     <!-- ... embedded component here ... -->
 *   </div>
 * </div>
 */
.embedded-wrapper {
  font-family: $font-family-base;
  font-size: $font-size-base;
  font-weight: $font-weight-base;
  line-height: $line-height-base;
  color: $body-color;
  text-align: left;
  background-color: rgb(255, 255, 255);
}
```

And an example Webpack 3 SCSS/CSS rule to process it:

```javascript
{
  test: /(.scss|.css)$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        importLoaders: 1,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        ident: 'postcss',
        plugins: () => [
          /* eslint-disable global-require */
          require('autoprefixer'),
          require('postcss-initial')(),
          require('postcss-prepend-selector')({ selector: '#embedded.embedded ' }),
          /* eslint-enable global-require */
        ],
      },
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
        includePaths: [
          path.join(__dirname, '../node_modules'),
          path.join(__dirname, '../src'),
        ],
      },
    },
  ],
},
```

### Include pre-built CSS

This project includes built CSS files in-case you are not using Webpack or
PostCSS. However, all of the styles are scoped to the hard-coded selector
"#embedded.embedded". Make sure there is an element on the page that has the id
"embedded" and a class name of "embedded". The styles will be applied to that
div.

```html
<html>
  <head>
    <!--- ... other stylesheets ... -->
    <link rel="stylesheet" type="text/css" href="default.min.css">
  </head>
  <body>
    <!-- ... other elements not affected ... -->
    <div id="embedded" class="embedded">
      <!--- ... embedded component here will be reset to default ... -->
    </div>
    <!-- ... other elements not affected ... -->
  </body>
</html
```
