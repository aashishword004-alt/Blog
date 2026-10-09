import argon2 from "argon2"

const security = {
    async converthash(password) {
        try {
            const hash = await argon2.hash(password);
            return hash;
        } catch (err) {
            console.log('password Hash fails')
        }
    },
    async compare(compare,hash) {
        try {
            if (await argon2.verify(hash,compare)) {
                 return true
            } else {
                console.log('not')
                return false
            }
        } catch (err) {
            console.log(err)
        }
    }
}

export default security