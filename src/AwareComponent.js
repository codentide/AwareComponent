export class AwareComponent extends HTMLElement {

  constructor() {
    super()

    const useShadow = this.constructor.useShadow ?? true
    const cssText = this.constructor.cssText ?? null

    if (useShadow) {
        this.attachShadow({ mode: 'open' })
        this.$root = this.shadowRoot
    } else {
        this.$root = this
    }
    if (useShadow && cssText) {
      this.decorate(cssText)
    }
  }

  /**
   * The root element of the component.
   * 
   * This serves as the main DOM container where all internal queries and operations are scoped.
   * It is typically assigned during the component's initialization.
   *
   * @type {HTMLElement}
  */
  $root = null;

  static get observedAttributes() {
    return this.observedItems || []
  }

  /**
   * The template property is used to store the HTML template for the component.
   * It is typically set during the render method.
   *
   * @type {string}
   * @memberof AwareComponent
   * @returns {void}
  */
  set template(value){
    this.$root.appendChild(value)
  }

  get template() {
    return this.$root.innerHTML
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return

    const setter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(this), name)?.set;

    if (setter) {
      setter.call(this, newValue);
    } else {
      this[name] = newValue;
    }

    // if (typeof this.onAttributeChanged === 'function') {
    //   this.onAttributeChanged(name, oldValue, newValue)
    // }

    if (this._isConnected) this.updateReferences(name);
  }

  connectedCallback() {
    this._isInitialized = true
    if (typeof this.onInit === 'function') this.onInit()

    this.render() 
    this.updateReferences()

    this._isConnected = true
    if (typeof this.onConnected === 'function') this.onConnected()
  }

  onInit(){
    console.log(this.localName + " initialized");
  }

  /**
     * Called when the component is connected to the DOM.
     * This method can be overridden to perform actions after the component is inserted into the DOM.
     * 
     * @memberof AwareComponent
     * @returns {void}
  */
  onConnected() {
    console.log(this.localName + " connected");
  }

  /**
   * Applies one or more CSS stylesheets to the component's shadow DOM.
   * 
   * This method accepts either a single CSS string or an array of CSS strings. Each CSS string is used to create
   * a new `CSSStyleSheet` and injected into the component's shadow DOM. The styles will only affect elements inside
   * the shadow DOM.
   * 
   * If the component already has stylesheets applied, the new stylesheets will be added to the list of existing ones.
   * 
   * @param {string | string[]} css - The raw CSS text or an array of CSS text that will be applied to the component's shadow DOM.
   * @returns {void}
  */
  decorate(css) {
    const cssArray = Array.isArray(css) ? css : [css]

    const newSheets = cssArray.map(text => {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(text)
      return sheet
    })

    this.shadowRoot.adoptedStyleSheets = [...(this.shadowRoot.adoptedStyleSheets || []), ...newSheets]
  }

  /**
   * Renders a fallback message when no custom render method is implemented.
   * Displays a warning in the console and a centered message in the component.
   * 
   * @memberof AwareComponent
   * @returns {void}
  */
  render() {
    this.template = html`
    <style>
      .no-render {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 100%;
      }

      .no-render__text {
        display:inline-block;

        padding: 1rem 1.6rem;
        border-radius: .8rem;

        font-family: monospace;
        font-size: 1rem;
        font-style: italic;

        color: lightcoral;
        background-color:rgb(37, 19, 19);
      }
    </style>
    <div class="no-render">
      <p class="no-render__text" title="Use render() function in your component">No Render() in ${this.tagName.toLowerCase()}</p>
    </div>`
    console.warn(`No Render() in ${this.tagName.toLowerCase()} implemented`)
  }

  /**
   * Selects the first element within the component's root element that matches the given CSS selector.
   * 
   * This method uses `querySelector` to find the first matching element within the root element
   * of the component, which is either the shadow DOM or the light DOM, depending on the component's configuration.
   * 
   * @param {string} query - The CSS selector to match the elements.
   * @returns {Element|null} The first matching element, or `null` if no elements match.
  */
  select(query, scope = this.$root) {
    const element = scope.querySelector(query)

    if (!element) {
      console.warn("Elemento " + query + " no encontrado.");
      return null
    }

    return element
  }

  /**
   * Selects all elements within the component's root element that match the given CSS selector.
   *
   * This method uses `querySelectorAll` to find all matching elements within the given scope 
   * (defaults to the component's root element). It returns an array of all matching elements.
   * If no elements are found, it logs a warning and returns an empty array.
   *
   * @param {string} query - The CSS selector to match the elements.
   * @param {Element} [scope=this.$root] - The scope in which to search for the elements.
   * @returns {Element[]} An array of all matching elements, or an empty array if none are found.
  */
  selectAll(query, scope = this.$root) {
    const elements = scope.querySelectorAll(query)

    if (!elements || elements.length === 0) {
      console.warn("Elementos " + query + " no encontrados");
      return []
    }

    return Array.from(elements)
  }

  /**
   * Updates the content of elements with the `data-ref` attribute, based on the component's properties.
   * 
   * This method searches for all elements within the component's root element that have the `data-ref` attribute
   * and updates their content according to the corresponding property value of the component. It only updates the
   * elements whose `data-ref` matches the property name.
   * 
   * If a specific attribute name (`changedAttribute`) is provided, the method only updates elements that correspond
   * to that attribute.
   *
   * @param {string|null} [changedAttribute=null] - The name of the attribute to filter the updates (optional).
   * If provided, only elements whose `data-ref` matches this attribute will be updated.
  */
  updateReferences(changedAttribute = null) {
    const references = [...this.selectAll('[data-ref]')]

    references.forEach(element => {
      const property = element.getAttribute('data-ref')

      if (!property || changedAttribute && property !== changedAttribute) return

      const value = this[property]
      if (value == null) return

      if (element.localName === 'img') {
        element.setAttribute('data-value', value)
        element.setAttribute('src', value)
      } else {
        element.setAttribute('data-value', value)
        element.textContent = value
      }
    })
  }
}

// Escapa caracteres peligrosos para prevenir inyecciones HTML/JS (XSS)
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")   // & se vuelve &amp;
    .replace(/</g, "&lt;")    // < se vuelve &lt;
    .replace(/>/g, "&gt;")    // > se vuelve &gt;
    .replace(/"/g, "&quot;")  // " se vuelve &quot;
    .replace(/'/g, "&#039;"); // ' se vuelve &#039;
}

/**
 * Safely renders an HTML template literal, escaping dynamic values to prevent XSS
 * and replacing `({variable})` markers with <span> elements containing `data-ref` attributes.
 * 
 * @function html
 * @param {TemplateStringsArray} templates - The static parts of the template literal.
 * @param {...any} values - The dynamic values to interpolate, which will be HTML-escaped.
 * @returns {DocumentFragment} A safe HTML fragment ready to be inserted into the DOM.
 * 
 * @example
 * const name = "<script>alert('xss')</script>";
 * const frag = html`Hello ({user}), your name is: ${name}`;
 * document.body.appendChild(frag);
 * 
 * // Renders:
 * // Hello <span data-ref="user">user</span>, your name is: &lt;script&gt;alert('xss')&lt;/script&gt;
 * 
 * @remarks
 * The `({variable})` syntax is used as a placeholder for later dynamic updates,
 * which can be targeted via `[data-ref="variable"]`.
 */
export function html(templates, ...values) {
  const template = document.createElement('template')
  let str = templates[0]

  values.forEach((val, i) => {
    str += escapeHTML(val) + templates[i + 1]
  })

  // Detectar ({variable}) incluyendo los paréntesis
  const regex = /\(\{([^}]+)\}\)/g
  str = str.replace(regex, (_, key) => {
    const safeRef = escapeHTML(key)
    return `<span data-ref="${safeRef}">${safeRef}</span>`
  })

  template.innerHTML = str.trim()
  return template.content.cloneNode(true)
}
