# Region

Regions binds views to DOM. It represents an element of a page where a view will be loaded.

## Constructor (el [, jQuery])

el can be a jQuery selector or a jQuery object. This is where the region will render the view.
*jQuery* parameter is the actual jQuery object. By default this will be set to window.$ on the
browser. jQuery instance can be passed manually on server where there is no window object.
Region will use the jQuery instance and ensures that it will be used on all views rendered
through the region.

### Browser
```js
var view = new Simplex.View({
    template: '<span>Hello!</span>'
});

var region = new Simplex.Region('#body');
region.show(view);
```

### Server using jsdom
```js
// Create DOM
var document = jsdom(htmTemplate); // Your html markup
var window = document.parentWindow;
var $ = require('jquery')(window); // Create jQuery instance

var view = new Simplex.View({
    template: '<span>Hello!</span>'
});

var region = new Simplex.Region('#body', $);
region.show(view);

// Updated HTML with view rendered
console.log(window.document.documentElement.outerHTML);
```

## - show (view)

Render a view to region. This will close all previously rendered views.

## - append (view)

Append a view to region. Current view(s) will not get closed.

## - close ([view])

Close specified view. If view is not provided then all views will be closed.

## - get (viewId)

Get the view object using its id (_sid).

## Sample
```js
// Create a reusable view
var UserView = Simplex.View.extend({
    template: '<h1 sx-value="name"></h1>'
});

var region = new Simplex.Region('#body');
region.show(view);

var user1 = new UserView({ name: 'Rick' });
var user2 = new UserView({ name: 'Daryl' });
var user3 = new UserView({ name: 'Michonne' });

region.show(user1); // Rick is displayed
region.show(user2); // Rick is replaced with Daryl
region.append(user3); // Daryl and Michonne is displayed

var daryl = region.get(user2._sid);
daryl === user2; // true

region.close(); // clears the region
```