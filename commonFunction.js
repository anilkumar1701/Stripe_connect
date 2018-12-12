


/*
 * --------------------------------------
 * CHECK EACH ELEMENT OF ARRAY FOR BLANK
 * --------------------------------------
 */
exports.checkBlank = function (arr) {
    if (!Array.isArray(arr)) {
        return 1;
    }

    let arrlength = arr.length;
    for (let i = 0; i < arrlength; i++) {
        if (arr[i] === undefined || arr[i] == null) {
            arr[i] = "";
        } else {
            arr[i] = arr[i];
        }
        arr[i] = arr[i].toString().trim();
        if (arr[i] === '' || arr[i] === "" || arr[i] === undefined) {
            return 1;
            break;
        }
    }
    return 0;
};