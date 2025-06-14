// Make sure that ValidityState is supported in full (all features)
const supported = function () {
    const input = document.createElement("input");
    return (
        "validity" in input &&
        "badInput" in input.validity &&
        "patternMismatch" in input.validity &&
        "rangeOverflow" in input.validity &&
        "rangeUnderflow" in input.validity &&
        "stepMismatch" in input.validity &&
        "tooLong" in input.validity &&
        "tooShort" in input.validity &&
        "typeMismatch" in input.validity &&
        "valid" in input.validity &&
        "valueMissing" in input.validity
    );
};

/**
 * Generate the field validity object
 * @param  {Node]} field The field to validate
 * @return {Object}      The validity object
 */
const getValidityState = function (field) {
    // constiables
    const type = field.getAttribute("type") || input.nodeName.toLowerCase();
    const isNum = type === "number" || type === "range";
    const length = field.value.length;
    const valid = true;

    // Run validity checks
    const checkValidity = {
        badInput: isNum && length > 0 && !/[-+]?[0-9]/.test(field.value), // value of a number field is not a number
        patternMismatch:
            field.hasAttribute("pattern") &&
            length > 0 &&
            new RegExp(field.getAttribute("pattern")).test(field.value) === false, // value does not conform to the pattern
        rangeOverflow:
            field.hasAttribute("max") &&
            isNum &&
            field.value > 0 &&
            Number(field.value) > Number(field.getAttribute("max")), // value of a number field is higher than the max attribute
        rangeUnderflow:
            field.hasAttribute("min") &&
            isNum &&
            field.value > 0 &&
            Number(field.value) < Number(field.getAttribute("min")), // value of a number field is lower than the min attribute
        stepMismatch:
            isNum &&
            ((field.hasAttribute("step") &&
                field.getAttribute("step") !== "any" &&
                Number(field.value) % Number(field.getAttribute("step")) !== 0) ||
                (!field.hasAttribute("step") && Number(field.value) % 1 !== 0)), // value of a number field does not conform to the stepattribute
        tooLong:
            field.hasAttribute("maxLength") &&
            field.getAttribute("maxLength") > 0 &&
            length > parseInt(field.getAttribute("maxLength"), 10), // the user has edited a too-long value in a field with maxlength
        tooShort:
            field.hasAttribute("minLength") &&
            field.getAttribute("minLength") > 0 &&
            length > 0 &&
            length < parseInt(field.getAttribute("minLength"), 10), // the user has edited a too-short value in a field with minlength
        typeMismatch:
            length > 0 &&
            ((type === "email" &&
                !/^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(
                    field.value
                )) ||
                (type === "url" &&
                    !/^(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*)(?::\d{2,5})?(?:[\/?#]\S*)?$/.test(
                        field.value
                    ))), // value of a email or URL field is not an email address or URL
        valueMissing:
            field.hasAttribute("required") &&
            (((type === "checkbox" || type === "radio") && !field.checked) ||
                (type === "select" && field.options[field.selectedIndex].value < 1) ||
                (type !== "checkbox" &&
                    type !== "radio" &&
                    type !== "select" &&
                    length < 1)), // required field without a value
    };

    // Check if any errors
    for (const key in checkValidity) {
        if (checkValidity.hasOwnProperty(key)) {
            // If there's an error, change valid value
            if (checkValidity[key]) {
                valid = false;
                break;
            }
        }
    }

    // Add valid property to validity object
    checkValidity.valid = valid;

    // Return object
    return checkValidity;
};

// If the full set of ValidityState features aren't supported, polyfill
if (!supported()) {
    Object.defineProperty(HTMLInputElement.prototype, "validity", {
        get: function ValidityState() {
            return getValidityState(this);
        },
        configurable: true,
    });
}
