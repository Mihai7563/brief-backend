export function isNumber(fieldValue, decimals = false, maxDigits = 4) {
    const testRegex = `^(0|[1-9]\d{0,${maxDigits - 1}})$`;
    console.log(testRegex);
    const numberRegex = decimals ? new RegExp(`^(\\d+\\.?\\d*)$`) : new RegExp(`^(0|[1-9]\\d{0,${maxDigits - 1}})$`);
    return numberRegex.test(fieldValue);
}


//isValidTitle, isValidDesc etc
export function isString(fieldValue, minLength = 1, maxLength = 255){
    const stringRegex = new RegExp(`^[\\w\\s]{${minLength},${maxLength}}$`);
    return stringRegex.test(fieldValue);
}

export function getCurrentDate(){
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function checkDateFormat(dateString){
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(dateString);
}
