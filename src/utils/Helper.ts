import Crypto = require('crypto');

export const Helper = {

    // You may append additional functions
    getDayString: (index: number) => {

        const days: Array<string> = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return days[index];

    },
    arrayStringHelper: (data: any, value: any, add: boolean) => {
        // change curly brackets to square brackets
        let temp1 = data.rows[0].identities.replace(/{/, "[");
        let temp2 = temp1.replace(/}/, "]");

        // 1. Deserialize the string to convert it to a list/array
        let result = JSON.parse(temp2);
        
        if (add) {
            // Add/push id value to the list/array
            result.push(value);
        }
        else {
            // Remove/pop id value from the list/array
            let index = result.indexOf(value, 0);
            if (index > -1) {
                result.splice(index, 1);
            }
        }

        // 1. Serialize the list/array
        // 2. Replace square brackets to curly brackets
        temp1 = JSON.stringify(result).replace("[", "{");
        let newResult = temp1.replace("]", "}");

        return newResult;
    },
    decipherPassword: (algorithm: string, iv: any, encryptionKey: string, cipheredText: any) => {

        let decipher = Crypto.createDecipheriv(algorithm, encryptionKey, iv);
        let decrypted = decipher.update(cipheredText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    },
    hashPassword: (algorithm: string, text: string) => {

        return Crypto.createHash(algorithm).update(text).digest('hex');

    }
}