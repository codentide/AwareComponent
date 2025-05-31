# AwareComponent

*A lightweight base class for building Web Components with optional Shadow DOM and simple reactivity.*

## What is AwareComponent?

`AwareComponent` is a class that extends `HTMLElement` to simplify building modern Web Components, allowing you to:

- Use or opt out of Shadow DOM as needed.
- Declare observed attributes and automatically update the DOM when they change.
- Keep your components minimal and easy to understand.

## Installation

```bash
npm install aware-component
```
<!-- 
Or simply import it directly from a CDN if you're not using a bundler:

```html
<script type="module" src="https://unpkg.com/aware-component@1.0.0/src/AwareComponent.js"></script>
``` -->

## Usage Example

```js
import { AwareComponent, html } from 'aware-component'

class UserCard extends AwareComponent {
  static observedItems = ['user-name', 'age']
  static cssText = /*css*/`
    div{
      // css..
    }
  `

  render() {
    this.template = html`
      <div>
        <h1>${this.userName}</h1>
        <p>${this.age}</p>
      </div>
    `
  }
}

customElements.define('user-card', UserCard)
```

Then in your HTML:

```html
<user-card user-name="Jane" age="28"></user-card>
```

## 🔧 API and Features

- `static useShadow`: Enables Shadow DOM by default (`true`). You can disable it.
- `static cssText`: Allows injecting CSS directly as a string.
- `static observedItems`: List of attributes to observe.
- `render()`: Method to be overridden to define the component's DOM.
- `updateReferences(attr?)`: Dynamically updates elements with `data-ref` matching the attribute name.

## Authors

- **Marco Del Boccio** - [Email](mailto:marcodelboccio77@email.com)
- **Diego Torres** - [Email](mailto:diegotorres0303@email.com)

Both contributed equally to the creation and design of this component.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

