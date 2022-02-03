<script>
    let formObj = {
        name: "",
        email: "",
        dob: "",
    };
    export const handleSubmit = () => {
        console.log(formObj);
    };
</script>

<form id="testform" on:submit|preventDefault={handleSubmit}>
    <input
        id="form-name"
        type="text"
        name="fullname"
        placeholder="Full name"
        bind:value={formObj.name}
    />
    <input
        id="form-dob"
        type="text"
        name="dob"
        placeholder="DOB"
        bind:value={formObj.dob}
    />
    <input
        id="form-email"
        type="text"
        name="emailID"
        placeholder="EmaiID"
        bind:value={formObj.email}
    />
    <input id="form-submit" type="submit" value="submit" />
</form>

<p>Name: {formObj.name}</p>
