import App from './App.svelte'
import Form from './Form.svelte'

const app = new App({
  target: document.getElementById('app')
})
new Form({
  target: document.getElementById('formdiv')
})

export default app
