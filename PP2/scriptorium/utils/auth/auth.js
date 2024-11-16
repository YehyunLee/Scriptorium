// password validation
function validatePassword(password) {
    // Password rules:
    // 1- Password must be at least 8 characters long
    // 2- Password must contain at least one letter
    // 3- Password must contain at least one number
    // 4- Password must contain at least one special character

    return !(password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*()_]/.test(password));
}


export {validatePassword};