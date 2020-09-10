const generator = require('generate-password');

class AutoGeneratePassword {
    static password() {
        const password = generator.generate({
            length: 10,
            numbers: true,
        });
        return password;
    }
}

export default AutoGeneratePassword;
