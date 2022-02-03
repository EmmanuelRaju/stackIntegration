<script>
    export const handleSubmit = (e) => {
        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);
        console.log(formProps);
    };
</script>

<form id="testform" on:submit|preventDefault={handleSubmit}>
    <input type="text" name="fullname" placeholder="Full name" />
    <input type="text" name="dob" placeholder="DOB" />
    <input type="text" name="emailID" placeholder="EmaiID" />
    <input type="submit" value="submit" />
</form>
