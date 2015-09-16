# View

Views in Simplex.js determines what the users will see and reacts to their actions. 
It has data-binding features to easily bind data and events to DOM. View also 
auto updates when the model and collection that it is bound gets updated.

## Constructor (options)

Options will be included as part of the view's attributes.

## template property

The only special attribute that a view requires. View will use the template to 
generate HTML and bind data. This can be set by extending a view or by passing
it as an option.

```js
var view = new Simplex.View({
    template: '<span sx-value="name"></span>',
    name: 'Simplex.js!'
});

var region = new Simplex.Region('#body');
region.show(view);
```

## Data Binding Syntax

Simplex has it's own syntax on how to bind the template to the view properties.
To bind an HTML element to a view property you need to use the prefix 'sx-' then
the keywork or attribute name you want to bind. Here is a quick sample.

```js
// Bind using special keyword
var view = new Simplex.View({
    template: '<span sx-value="name"></span>',
    name: 'Simplex.js!'
});

// Bind to an HTML attribute
var view = new Simplex.View({
    template: '<span sx-style="style">Simplex.js</span>',
    style: 'color: blue'
});

// Bind to an event
var view = new Simplex.View({
    template: '<span sx-ev-click="reply">Hi</span>',
    reply: function() { alert('Hello'); }
});
```

## Special Keywords

These keywords have special function.

### - id

Add the elements jQuery as a view property. This is used to easily access the element
from the view.

```js
var view = new Simplex.View({
    template: '<span sx-id="$span">Hello!</span>',
    showed: function() {
        // $span is accessible from the view
        this.$span.html('Hi!');
    }
});
```

## - region

Create a Simplex.Region using the element then save it as a view property.

```js
var view = new Simplex.View({
    template: '<div sx-region="subView"></div>',
    showed: function() {
        var subView = new Simplex.View({
            template: '<span>Hello!</span>'
        });
    
        // subView is accessible from the view
        this.subView.show(subView);
    }
});
```

## - value

Bind the innerHTML or text (On input tags) of the element to view properties. If 
supplied value is a models property then the view will auto update when the model changes.

```js
// result: <span>Hi!</span>
var view = new Simplex.View({
    template: '<span sx-value="message"></span>',
    message: 'Hi!'
});

var model = 

// result: <input type="text" value="Hi!"></input>
var viewModel = new Simplex.View({
    template: '<input type="text" sx-value="message"></input>',
    message: 'Hi!'
});
```

## - items

Renders the specified collection/array inside the element. The template can be the 
innerHTML of the element or inherited from the view option (See items-options).


```html
<div id="template">
    <h1>Hello!</h1>
    <ul sx-items="users">
        <li sx-value="item.name"></li>
    </ul>
</div>
```

```js
var view = new Simplex.View({
    template: '#template',
    users: ['User1', 'User2', 'User3']
});

var region = new Simplex.Region('#body');
region.show(view);
```

## - options
