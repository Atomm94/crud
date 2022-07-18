/* eslint-disable no-useless-escape */

export function validate (string: string) {
    let message
    if (
        /\d/.test(string) &&
        /[A-Z]/.test(string) &&
        /[a-z]/.test(string)
        // && /[ `!@#$%^&*()_+\-=\[\]\{\};':"\\|,.<>\/?~]/.test(string)
    ) {
        message = undefined
        return { success: true }
    } else if (string.length === 0) {
        message = 'Password field required'
    } else if (string.length < 7) {
        message = 'Password field must have min 7 character'
    } else if (!/\d/.test(string)) {
        message = 'Password field must have number'
    } else if (!/[A-Z]/.test(string)) {
        message = 'Password field must have upper case letter'
    } else if (!/[a-z]/.test(string)) {
        message = 'Password field must have lower case letter'
    }
    //  else if (!/[ `!@#$%^&*()_+\-=\[\]\{\};':"\\|,.<>\/?~]/.test(string)) {
    //     message = 'Password field must have special character'
    // }

    return { success: false, message: message }
}
