import { AwareComponent, html } from "../../../src/AwareComponent";
import styleSheet from "./UserCard.css?raw"

export class UserCard extends AwareComponent {

    static observedItems = ["name", "email"]
    static cssText = styleSheet

    onInit(){

    }

    render() {
        this.template = html`
        <div class="user-card" title="({name})" email="({})">
            <h2>${this.name}</h2>
            <p>({email})</p>
            <div class="user-card__button-box">
                <button data-id="update-name">Update name</button>
                <button data-id="update-email">Update email</button>
            </div>
            <input data-id="input" type="text" placeholder="type here...">
        </div>`
    }

    onConnected(){
        const updateEmailBtn = this.select("[data-id='update-email']")
        const updateNameBtn = this.select("[data-id='update-name']")
        const input = this.select("[data-id='input']")

        updateEmailBtn.addEventListener("click", () => {
            const value = input.value
            if (value){
                this.email = value
                input.value = ""
            }
        })

        updateNameBtn.addEventListener("click", () => {
            const value = input.value
            if (value){
                this.setAttribute("name", value)
                input.value = ""
            }
        })
    }

    // Setters and getters
    set email(value){
        console.log("[EMAIL]", this.email);
        this.setAttribute("email", value)
        this.select("div").setAttribute("email", value)
    }

    get email(){
        return this.getAttribute("email")
    }

}

customElements.define("user-card", UserCard)