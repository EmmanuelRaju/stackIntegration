import { render, fireEvent, getByText } from '@testing-library/svelte';
import Form, { handleSubmit } from '../src/Form.svelte';


test('testing form on submit', async () => {
    const { debug, getByText } =
        render(Form);

    const nameInput = document.querySelector('#form-name');
    nameInput.setAttribute('value', 'test');

    const emailInput = document.querySelector('#form-email');
    emailInput.setAttribute('value', 'test@gmail.com');

    const dobInput = document.querySelector('#form-dob');
    dobInput.setAttribute('value', '08/01');

    const buttonInput = document.querySelector('#form-submit')

    await fireEvent.submit(buttonInput);

    debug();

    expect(getByText("test")).toBeInTheDocument()

});
